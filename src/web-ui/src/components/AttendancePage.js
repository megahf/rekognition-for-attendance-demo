import React, {useState } from "react";
import { Col, Row } from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory, { textFilter, selectFilter } from 'react-bootstrap-table2-filter';

import gateway from "../utils/gateway";
import { isUndefined, formatErrorMessage } from "../utils";

const AttendancePage = (props) => {
  //const currentUrl = window.location.href;

  const selectOptions = {
    'false': 'false',
    'true': 'true'
  };

  const columns = [{
    dataField: 'name',
    text: 'Name',
    filter: textFilter(),
    footer: ""

  },{
    dataField: 'isPresent',
    text: 'Present',
    filter: selectFilter({
        options: selectOptions
    }),
    footer: ""
  },{
    dataField: 'checkinTime',
    text: 'Check-in Time',
    sort: true,
    footer: columnData => "Total: " + columnData.reduce((acc, item) => acc + 1, 0)
  },]

  const [attendanceResult, setAttendanceResult] = useState([]);

  const getAttendanceList = async () => {
    try {
      const result = await gateway.getAttendanceList();
      setAttendanceResult(result);
      //console.log(result);
      //return result;
    } catch (e) {
      //setErrorDetails(formatErrorMessage(e));
      console.log(e);
    }
  };

  if (props.show) {

    getAttendanceList();
    return (
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <h1>Attendance List</h1>
          <BootstrapTable keyField='name' data={ attendanceResult } columns={ columns } filter={ filterFactory() } footerClasses="footer-class"/>
        </Col>
      </Row>
    );
  }
  return "";
};

export default AttendancePage;
