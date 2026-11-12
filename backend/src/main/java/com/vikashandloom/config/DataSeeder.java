package com.vikashandloom.config;

import com.vikashandloom.model.*;
import com.vikashandloom.repo.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

/** Bootstraps the admin account and clearly-labelled DEMO catalogue data (no real inventory or prices). */
@Component
public class DataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String[][] HOME = {
        {"Blankets", "Warm, soft blankets for every season."}, {"Single Bedsheets", "Bedsheets for single beds."},
        {"Double Bedsheets", "Bedsheets for double beds."}, {"Comforters", "Quilted comforters for cosy nights."},
        {"Sofa Covers", "Protective, stylish covers for sofas."}, {"Table Covers", "Dining and centre table covers."},
        {"Towels", "Absorbent towels for bath and hand."}, {"Pillow Covers", "Pillow covers in many colours."},
        {"Cushions", "Filled cushions for sofa and bed."}, {"Cushion Covers", "Decorative cushion covers."},
        {"Doormats", "Hard-wearing doormats."}, {"Carpets", "Carpets and rugs for living spaces."},
        {"Door Curtains", "Curtains sized for doors."}, {"Window Curtains", "Curtains sized for windows."}};
    private static final String[][] CLOTHING = {
        {"Sarees", "Sarees - enquire on 7354422949."}, {"Suits", "Suit collections."}, {"Women's Sweaters", "Winter sweaters for women."}};
    private static final String[] COLORS = {"Indigo", "Maroon", "Forest Green", "Mustard", "Teal", "Rose Pink"};
    private static final String[] HEX = {"#2f3e8f", "#7a1f2b", "#2f6b4a", "#d19a1f", "#1f7a7a", "#d96b8b"};
    private static final String[] PATTERNS = {"Stripes", "Floral", "Checks", "Geometric", "Solid", "Zigzag"};
    private static final String[] ACCENT = {"#8b5e3c", "#7a3b3b", "#4b6a54", "#9b7a2f", "#3f6f7a", "#a05a6e"};

    private final AppProps props;
    private final UserRepo users;
    private final CategoryRepo categories;
    private final ProductRepo products;
    private final PasswordEncoder encoder;

    public DataSeeder(AppProps props, UserRepo users, CategoryRepo categories, ProductRepo products, PasswordEncoder encoder) {
        this.props = props; this.users = users; this.categories = categories; this.products = products; this.encoder = encoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        bootstrapAdmin();
        if (props.seedDemoData() && categories.count() == 0) seedCatalogue();
    }

    private void bootstrapAdmin() {
        AppUser admin = users.findByUsername(props.adminUsername()).orElse(null);
        String pw = props.adminPassword();
        if (admin == null) {
            boolean generated = pw == null || pw.isBlank();
            if (generated) pw = randomPassword();
            admin = new AppUser();
            admin.setUsername(props.adminUsername());
            admin.setRole(Role.ADMIN);
            admin.setPasswordHash(encoder.encode(pw));
            users.save(admin);
            if (generated) {
                log.warn("==========================================================");
                log.warn(" ADMIN ACCOUNT CREATED  username: {}  password: {}", props.adminUsername(), pw);
                log.warn(" Shown once. Set ADMIN_PASSWORD env var to choose your own.");
                log.warn("==========================================================");
            } else log.info("Admin account '{}' created from ADMIN_PASSWORD.", props.adminUsername());
        } else if (pw != null && !pw.isBlank() && !encoder.matches(pw, admin.getPasswordHash())) {
            admin.setPasswordHash(encoder.encode(pw));
            users.save(admin);
            log.info("Admin password updated from ADMIN_PASSWORD.");
        }
    }

    private static String randomPassword() {
        String a = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        SecureRandom r = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 16; i++) sb.append(a.charAt(r.nextInt(a.length())));
        return sb.toString();
    }

    private void seedCatalogue() {
        int order = 0;
        for (String[] c : HOME) addCategory(c, "HOME_FURNISHING", order++);
        for (String[] c : CLOTHING) addCategory(c, "CLOTHING", order++);
        List<Category> cats = categories.findAllByOrderBySortOrderAscNameAsc();
        int n = 0;
        for (Category c : cats) {
            for (int i = 0; i < 3; i++, n++) {
                int ci = n % COLORS.length, pi = (n * 5 + n / 6) % PATTERNS.length;
                Product p = new Product();
                p.setName("DEMO " + c.getName().replaceAll("s$", "") + " - " + COLORS[ci] + " " + PATTERNS[pi]);
                p.setDescription("Demonstration product used to preview the website. Replace with real inventory from the admin dashboard. "
                        + "Price and stock are placeholders.");
                p.setCategory(c);
                p.setColor(COLORS[ci]); p.setColorHex(HEX[ci]); p.setPattern(PATTERNS[pi]);
                p.setDesign(PATTERNS[pi] + " " + (i + 1));
                p.setSize(sizeFor(c.getName(), i));
                p.setStock(i == 2 ? 0 : 10 + i);
                p.setFeatured(n % 4 == 0); p.setNewArrival(n % 3 == 0); p.setPopular(n % 5 == 0); p.setDemo(true);
                for (int v = 1; v <= 2; v++) {
                    Variant x = new Variant();
                    int vi = (ci + v) % COLORS.length;
                    x.setLabel(COLORS[vi]); x.setColorHex(HEX[vi]); x.setSize(p.getSize()); x.setStock(5);
                    p.getVariants().add(x);
                }
                products.save(p);
            }
        }
        log.info("Seeded {} categories and {} demo products.", cats.size(), n);
    }

    private void addCategory(String[] c, String group, int order) {
        Category e = new Category();
        e.setName(c[0]); e.setSlug(c[0].toLowerCase().replace("'", "").replaceAll("[^a-z0-9]+", "-"));
        e.setDescription(c[1]); e.setGroup(group); e.setSortOrder(order); e.setAccentColor(ACCENT[order % ACCENT.length]);
        categories.save(e);
    }

    private static String sizeFor(String cat, int i) {
        return switch (cat) {
            case "Single Bedsheets" -> "Single";
            case "Double Bedsheets", "Comforters", "Blankets" -> i == 0 ? "Double" : "King";
            case "Sarees" -> "6.3 m";
            case "Suits", "Women's Sweaters" -> new String[]{"M", "L", "XL"}[i];
            case "Carpets" -> new String[]{"4x6 ft", "5x7 ft", "6x9 ft"}[i];
            default -> "Standard";
        };
    }
}