const AWS = require("aws-sdk");

const { REGION, TOPIC_ARN, ATTENDANCE_TABLE } = process.env;

const rekognition = new AWS.Rekognition({
  region: REGION,
});

const docClient = new AWS.DynamoDB.DocumentClient({
  region: REGION,
});

const sns = new AWS.SNS({ region: REGION });

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const percentageToString = (percentage) => Math.floor(percentage * 10) / 10;

const respond = (statusCode, response) => ({
  statusCode,
  body: JSON.stringify(response),
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  },
});

const detectFace = async (imageBytes) =>
  rekognition
    .searchFacesByImage({
      CollectionId: 'attendeesCollection', /* required */
      Image: { Bytes: imageBytes },
      FaceMatchThreshold: 60,
      MaxFaces: 1,
      QualityFilter: "AUTO"
    })
    .promise();

const addAttendance = async (name) => {
  console.log("inside addattendance");
  var currentTime = new Date().toLocaleString('en-UK', { timeZone: "Asia/Jakarta" }).split(', ')[1]
  console.log(currentTime)

  var params = {
    TableName: ATTENDANCE_TABLE,
    Key:{
        "name": name
    },
    UpdateExpression: "set isPresent = :p, checkinTime=:t",
    ExpressionAttributeValues:{
        ":p": "true",
        ":t": currentTime
    },
    ReturnValues:"UPDATED_NEW"
  };

  docClient.update(params).promise();

  console.log("addattendance end");
}

exports.processHandler = async (event) => {
  const body = JSON.parse(event.body);
  const imageBytes = Buffer.from(body.image, "base64");
  const shouldSendSNSNotifications = TOPIC_ARN !== "false";

  try {
    const faces = await detectFace(imageBytes);

    console.log(faces)

    if (faces.FaceMatches.length > 0) {
      res = {
        "Persons": [{
            "BoundingBox": faces.SearchedFaceBoundingBox,
            "Confidence": faces.FaceMatches[0].Face.Confidence,
            "Id": faces.FaceMatches[0].Face.ExternalImageId
        }]
      };

      console.log("adding data to dynamodb")
      const dbret = await addAttendance(faces.FaceMatches[0].Face.ExternalImageId)

    } else {
      res = {
        "Persons": [{
          "BoundingBox": faces.SearchedFaceBoundingBox,
          "Confidence": faces.SearchedFaceConfidencee,
          "Id": "Unknown Face"
      }]
      }
    }
    return respond(200, res);
  } catch (e) {
    console.log(e);
    if (e.message == "There are no faces in the image. Should be at least 1."){
      var res = {
        "Persons": []
    }
      return respond(200, res)
    }
    return respond(500, { error: e });
  }
};
