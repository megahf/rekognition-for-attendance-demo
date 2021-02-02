import request from "./request";

const gateway = {
  processImage(image) {
    return request("/process", "post", { image });
  },

  getAttendanceList() {
    return request("/getAttendanceList", "get", {});
  }
};

export default gateway;
