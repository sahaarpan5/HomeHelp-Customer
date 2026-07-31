const BASE_URL = 'https://nonfss.geniusconsultant.com/IFBiOSApi/api';

const API = {
  LOGIN_GCL: (loginID, password, imei, securityCode, deviceID, deviceType) =>
    `${BASE_URL}/GCLAuthenticateWithEncryptionV1?LoginID=${encodeURIComponent(
      loginID
    )}&password=${encodeURIComponent(
      password
    )}&IMEI=${encodeURIComponent(
      imei
    )}&SecurityCode=${encodeURIComponent(
      securityCode
    )}&DeviceID=${encodeURIComponent(
      deviceID
    )}&DeviceType=${encodeURIComponent(deviceType)}`,


  FETCH_ATTENDANCE: (loginID, financialYear, month, reportType, securityCode) =>
    `${BASE_URL}/SelfAttendance?LoginID=${encodeURIComponent(
      loginID
    )}&FinancialYear=${encodeURIComponent(
      financialYear
    )}&Month=${encodeURIComponent(
      month
    )}&ReportType=${reportType}&SecurityCode=${encodeURIComponent(securityCode)}`,

  POST_ATTENDANCE: (loginID, password, clientID, securityCode, address, longitude, latitude) =>
    `${BASE_URL}/postEmployeeAttendance?LoginID=${encodeURIComponent(
      loginID
    )}&password=${encodeURIComponent(
      password
    )}&ClientID=${encodeURIComponent(
      clientID
    )}&SecurityCode=${encodeURIComponent(
      securityCode
    )}&Address=${encodeURIComponent(
      address
    )}&Longitude=${encodeURIComponent(
      longitude
    )}&Latitude=${encodeURIComponent(latitude)}`,

  POST_ATTENDANCE_WITH_SELFIE: `${BASE_URL}/post_EmployeeAttendanceWithSelfy_V2`,

  FETCH_NOTIFICATION: (loginID, securityCode, reportType) =>
    `${BASE_URL}/get_EmployeeNotificationInfo?AEMEmployeeID==${encodeURIComponent(
      loginID
    )}&SecurityCode=${securityCode}&Operation=${encodeURIComponent(reportType)}`,


  FETCH_DASHBOARD_REPORT: (ReferenceNo, UserID, FinancialYear, Month, Operation, SubOperation, securityCode) =>
    `${BASE_URL}/get_EmployeeSalesRefDetails?ReferenceNo=${encodeURIComponent(ReferenceNo)}&UserID=${encodeURIComponent(UserID)}&FinancialYear=${encodeURIComponent(FinancialYear)}&Month=${encodeURIComponent(Month)}&Operation=${encodeURIComponent(Operation)}&SubOperation=${encodeURIComponent(SubOperation)}&SecurityCode=${encodeURIComponent(securityCode)}`,

  FETCH_CATEGORY: (ModuleNo, ID, ID1, ID2, ID3, securityCode) =>
    `${BASE_URL}/CommonDDL?ModuleNo=${encodeURIComponent(ModuleNo)}&ID=${encodeURIComponent(ID)}&ID1=${encodeURIComponent(ID1)}&ID2=${encodeURIComponent(ID2)}&ID3=${encodeURIComponent(ID3)}&SecurityCode=${encodeURIComponent(securityCode)}`,

  FETCH_TITLE: (ModuleNo, ID, ID1, ID2, ID3, securityCode) =>
    `${BASE_URL}/CommonDDL?ModuleNo=${encodeURIComponent(ModuleNo)}&ID=${encodeURIComponent(ID)}&ID1=${encodeURIComponent(ID1)}&ID2=${encodeURIComponent(ID2)}&ID3=${encodeURIComponent(ID3)}&SecurityCode=${encodeURIComponent(securityCode)}`,

  FETCH_FINANCIAL_SCHEME: (ModuleNo, ID, ID1, ID2, ID3, securityCode) =>
    `${BASE_URL}/CommonDDL?ModuleNo=${encodeURIComponent(ModuleNo)}&ID=${encodeURIComponent(ID)}&ID1=${encodeURIComponent(ID1)}&ID2=${encodeURIComponent(ID2)}&ID3=${encodeURIComponent(ID3)}&SecurityCode=${encodeURIComponent(securityCode)}`,


  FETCH_MODEL: (ModuleNo, ID, ID1, ID2, ID3, securityCode) =>
    `${BASE_URL}/CommonDDL?ModuleNo=${encodeURIComponent(ModuleNo)}&ID=${encodeURIComponent(ID)}&ID1=${encodeURIComponent(ID1)}&ID2=${encodeURIComponent(ID2)}&ID3=${encodeURIComponent(ID3)}&SecurityCode=${encodeURIComponent(securityCode)}`,

  MOBILE_VALIDATION: (MobileNo) =>
    `${BASE_URL}/CheckInvalidMobileNo?MobileNo=${encodeURIComponent(MobileNo)}`,

  EMAIL_VALIDATION: (EmailID) =>
    `${BASE_URL}/CheckInvalidEmailID?EmailID=${encodeURIComponent(EmailID)}`,

  POST_EMPLOYEE_SALES_MANAGE_V6: `${BASE_URL}/post_EmployeeSalesManageV6`,

  POST_OTP: (ReferenceNo, Status, securityCode) =>
    `${BASE_URL}/SalesCustomerSatisCodeUpdate?ReferenceNo=${encodeURIComponent(ReferenceNo)}&Status=${encodeURIComponent(Status)}&SecurityCode=${encodeURIComponent(securityCode)}`,

  INFORMATION_TOKEN_API: (ReferenceNo, securityCode) =>
    `${BASE_URL}/get_EmployeeSalesByReference?Reference=${encodeURIComponent(ReferenceNo)}&SecurityCode=${encodeURIComponent(securityCode)}`,

  GET_DELIVERY_ITEM: (ReferenceNo, UserID, FinancialYear, Month, Operation, SubOperation, securityCode) =>
    `${BASE_URL}/getEmployeeReferenceSalesDelivery?ReferenceNo=${encodeURIComponent(ReferenceNo)}&UserID=${encodeURIComponent(UserID)}&FinancialYear=${encodeURIComponent(FinancialYear)}&Month=${encodeURIComponent(Month)}&Operation=${encodeURIComponent(Operation)}&SubOperation=${encodeURIComponent(SubOperation)}&SecurityCode=${encodeURIComponent(securityCode)}`,


  COMMON_DDL: (ModuleNo, ID, ID1, ID2, ID3, securityCode) =>
    `${BASE_URL}/CommonDDL?ModuleNo=${encodeURIComponent(ModuleNo)}&ID=${encodeURIComponent(ID)}&ID1=${encodeURIComponent(ID1)}&ID2=${encodeURIComponent(ID2)}&ID3=${encodeURIComponent(ID3)}&SecurityCode=${encodeURIComponent(securityCode)}`,

  POST_EMPLOYEE_SALES_DELIVERY_UPDATE: `${BASE_URL}/post_EmployeeSalesManageV7`,

  GET_INFORMATION_TOKEN: (ReferenceNo, securityCode) =>
    `${BASE_URL}/get_CRMDummyTokenByReference?ReferenceNo=${encodeURIComponent(ReferenceNo)}&SecurityCode=${encodeURIComponent(securityCode)}`,

  GET_CONSOL_REPORT: (ReferenceNo, UserID,FinancialYear,Month,Operation,SubOperation,securityCode) =>
    `${BASE_URL}/get_EmployeeSalesRefDetails?ReferenceNo=${encodeURIComponent(ReferenceNo)}&UserID=${encodeURIComponent(UserID)}&FinancialYear=${encodeURIComponent(FinancialYear)}&Month=${encodeURIComponent(Month)}&Operation=${encodeURIComponent(Operation)}&SubOperation=${encodeURIComponent(SubOperation)}&SecurityCode=${encodeURIComponent(securityCode)}`,

  DEVICE_CHANGE_REQUEST: `${BASE_URL}/post_EmployeeMobileIMEIChnageRequest`,


  FETCH_LOGINTIME: (loginID,  securityCode) =>
    `${BASE_URL}/SelfAttendanceToDay?LoginID=${encodeURIComponent(
      loginID
    )}&SecurityCode=${encodeURIComponent(securityCode)}`,


    CHECK_REGULARIZE: (EmployeeID,  securityCode) =>
    `${BASE_URL}/get_LoginCheck?EmployeeID=${encodeURIComponent(
      EmployeeID
    )}&SecurityCode=${encodeURIComponent(securityCode)}`,

     POST_REGULARIZE: (LoginID,LoginDate,Remarks, Operation, securityCode) =>
    `${BASE_URL}/post_RegulariseAttendance?LoginID=${encodeURIComponent(
      LoginID
    )}&LoginDate=${encodeURIComponent(LoginDate)}&Remarks=${encodeURIComponent(Remarks)}&Operation=${encodeURIComponent(Operation)}&SecurityCode=${encodeURIComponent(securityCode)}`,



  EMPLOYEE_CHECKOUT_SALES: (code, sales, op, sec) =>
  `${BASE_URL}/EmployeeCheckOutDailySales?Code=${code}&SalesCount=${sales}&Operation=${op}&SecurityCode=${sec}`,


  EMPLOYEE_BREAK_IN_OUT: (empId, lat, lng, op, sec) =>
  `${BASE_URL}/EmployeeBreakInOut?EmployeeID=${empId}&Latitude=${lat}&Longitude=${lng}&Operation=${op}&SecurityCode=${sec}`,
};

// Add more endpoints here as needed


export default API;