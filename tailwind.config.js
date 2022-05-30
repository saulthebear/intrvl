module.exports = {
  content: ["./public/src/**/*.{html,js}", "./views/**/*.{html,ejs,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Josefin Sans", "sans-serif"],
      },
      colors: {
        "yellow-dark": "#F5CC62",
        "yellow-mid": "#ffc83c",
        "yellow-light": "#fcd87b",
        "red-dark": "#da2c2c",
        "red-mid": "#f53c3c",
        "red-light": "#f48181",
        "purple-dark": "#8d2cda",
        "purple-mid": "#9747ff",
        "purple-light": "#b775eb",
        "green-dark": "#96bc3b",
        "green-mid": "#b8dc6d",
        "green-light": "#c7e586",
      },
    },
  },
  plugins: [],
}
