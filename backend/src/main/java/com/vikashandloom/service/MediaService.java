package com.vikashandloom.service;

import com.vikashandloom.config.AppProps;
import com.vikashandloom.model.MediaFile;
import com.vikashandloom.repo.MediaRepo;
import com.vikashandloom.web.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.awt.*;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.UUID;

/** Local-disk image storage. Originals are never served to customers: they get a downscaled, watermarked copy. */
@Service
public class MediaService {
    private static final int CUSTOMER_MAX_PX = 1400;
    private final MediaRepo repo;
    private final Path dir;
    private final String watermark;

    public MediaService(MediaRepo repo, AppProps props) throws IOException {
        this.repo = repo;
        this.dir = Path.of(props.uploadDir()).toAbsolutePath().normalize();
        this.watermark = props.watermarkText();
        Files.createDirectories(dir);
    }

    public MediaFile store(MultipartFile f) throws IOException {
        if (f.isEmpty()) throw new ApiException(HttpStatus.BAD_REQUEST, "Empty file");
        byte[] bytes = f.getBytes();
        String ext;
        try (ImageInputStream in = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            Iterator<ImageReader> it = ImageIO.getImageReaders(in);
            if (!it.hasNext()) throw new ApiException(HttpStatus.BAD_REQUEST, "Not a valid image. Use JPG or PNG.");
            String fmt = it.next().getFormatName().toLowerCase();
            ext = switch (fmt) {
                case "jpeg", "jpg" -> "jpg";
                case "png" -> "png";
                default -> throw new ApiException(HttpStatus.BAD_REQUEST, "Only JPG and PNG images are supported.");
            };
        }
        String stored = UUID.randomUUID() + "." + ext;
        Files.write(dir.resolve(stored), bytes);
        MediaFile m = new MediaFile();
        m.setOriginalName(f.getOriginalFilename() == null ? "image" : f.getOriginalFilename().replaceAll("[^A-Za-z0-9._ -]", "_"));
        m.setStoredName(stored);
        m.setContentType(ext.equals("png") ? "image/png" : "image/jpeg");
        return repo.save(m);
    }

    public record Served(byte[] bytes, String contentType) {}

    public Served serve(Long id, boolean original) throws IOException {
        MediaFile m = repo.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Image not found"));
        Path p = dir.resolve(m.getStoredName()).normalize();
        if (!p.startsWith(dir) || !Files.exists(p)) throw new ApiException(HttpStatus.NOT_FOUND, "Image not found");
        if (original) return new Served(Files.readAllBytes(p), m.getContentType());
        BufferedImage src = ImageIO.read(p.toFile());
        if (src == null) throw new ApiException(HttpStatus.NOT_FOUND, "Image not found");
        double scale = Math.min(1.0, (double) CUSTOMER_MAX_PX / Math.max(src.getWidth(), src.getHeight()));
        int w = Math.max(1, (int) Math.round(src.getWidth() * scale)), h = Math.max(1, (int) Math.round(src.getHeight() * scale));
        BufferedImage out = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = out.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, w, h);
        g.drawImage(src, 0, 0, w, h, null);
        // tiled diagonal watermark
        int fs = Math.max(14, Math.min(w, h) / 16);
        g.setFont(new Font(Font.SANS_SERIF, Font.BOLD, fs));
        g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 0.22f));
        g.setColor(Color.WHITE);
        AffineTransform old = g.getTransform();
        g.rotate(Math.toRadians(-28), w / 2.0, h / 2.0);
        int tw = g.getFontMetrics().stringWidth(watermark) + fs * 2;
        for (int y = -h; y < h * 2; y += fs * 4)
            for (int x = -w, row = 0; x < w * 2; x += tw, row++) g.drawString(watermark, x + (y / (fs * 4) % 2) * tw / 2, y);
        g.setTransform(old);
        g.dispose();
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        ImageIO.write(out, "jpg", bos);
        return new Served(bos.toByteArray(), "image/jpeg");
    }
}