// Exact business details supplied by the shop owner.
export const BUSINESS = {
  name: 'VIKAS HANDLOOM',
  tagline: 'Make Every Corner of Your Home Beautiful.',
  addressLines: ['59 Nutan Nagar, Gajra Gear Square,', 'Dewas, Madhya Pradesh \u2013 455001, India.'],
  addressOneLine: '59 Nutan Nagar, Gajra Gear Square, Dewas, Madhya Pradesh 455001, India',
  general: ['9098115557', '9893345669'],
  saree: '7354422949',
}
export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS.addressOneLine)}`
export const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(BUSINESS.addressOneLine)}&output=embed`
export const telLink = (n: string) => `tel:+91${n}`
export const waLink = (n: string, text?: string) => `https://wa.me/91${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`
export const fmt = (n: string) => `${n.slice(0, 5)} ${n.slice(5)}`