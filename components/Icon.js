const PATHS = {
  book: (
    <>
      <path d="M4 5.5c2.2-1 5-1 8 .3 3-1.3 5.8-1.3 8-.3v13c-2.2-1-5-1-8 .3-3-1.3-5.8-1.3-8-.3v-13Z" />
      <path d="M12 5.8v13" />
    </>
  ),
  flame: (
    <>
      <path d="M12 3c1 2.5.6 4-1 5.5C9.3 10.2 8 11.8 8 14a4 4 0 0 0 8 0c0-1.2-.4-2-1-2.7.4 1.6-.1 2.7-1 3.2" />
      <path d="M12 21v-3.2" />
    </>
  ),
  chat: (
    <>
      <path d="M5 6.5h14a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 17.5h-8l-4.5 3v-3H5A1.5 1.5 0 0 1 3.5 16V8A1.5 1.5 0 0 1 5 6.5Z" />
      <path d="M8.5 11h7M8.5 14h4" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11.5" />
      <path d="m7.5 11.5 4.5 4.5 4.5-4.5" />
      <path d="M5 19.5h14" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.2" />
      <path d="m4.5 7 7.5 5.5L19.5 7" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2.2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  wifi: (
    <>
      <path d="M3.5 9.5a13 13 0 0 1 17 0" />
      <path d="M6.5 13a9 9 0 0 1 11 0" />
      <path d="M9.7 16.4a4.6 4.6 0 0 1 4.6 0" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  star: <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 3v2.2M12 18.8V21M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M3 12h2.2M18.8 12H21M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
    </>
  ),
  moon: <path d="M20 14.2A8 8 0 1 1 9.8 4a6.3 6.3 0 0 0 10.2 10.2Z" />,
  system: (
    <>
      <rect x="3" y="4.5" width="18" height="12" rx="1.8" />
      <path d="M9 20h6M12 16.5V20" />
    </>
  ),
};

export const ICON_OPTIONS = [
  ["book", "Sách"],
  ["flame", "Ngọn lửa"],
  ["chat", "Trò chuyện"],
  ["download", "Tải xuống"],
  ["link", "Liên kết"],
  ["mail", "Email"],
  ["calendar", "Lịch"],
  ["wifi", "Wifi"],
  ["star", "Ngôi sao"],
];

export const TONE_OPTIONS = [
  ["sky", "Xanh trời"],
  ["butter", "Vàng bơ"],
  ["mint", "Xanh bạc hà"],
  ["lilac", "Tím nhạt"],
  ["peach", "Cam đào"],
  ["navy", "Xanh navy"],
  ["red", "Đỏ"],
];

export default function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name] || PATHS.link}
    </svg>
  );
}
