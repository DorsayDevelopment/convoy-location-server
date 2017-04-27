class Location {
  constructor(user, lat, long, altitude=0) {
    this.user = user;
    this.lat = lat;
    this.long = long;
  }

  toString() {
    return `${this.user}|${this.lat}|${this.long}`
  }

  static fromString(str) {
    const data = str.split('|');
    const location = new Location();

    location.user = parseInt(data[0]);
    location.lat = parseFloat(data[1]);
    location.long = parseFloat(data[2]);

    return location;
  }
}

module.exports = Location;