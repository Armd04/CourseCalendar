'use client';

import styled from 'styled-components';

const CalendarContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #000;
  color: #fff;
`;

const Sidebar = styled.div`
  width: 200px;
  background-color: #1a1a1a;
  padding: 20px;
  text-align: center;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  overflow-x: scroll;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  border: 1px solid #333;
  padding: 10px;
  background-color: #444;
  width: 20%;
`;
const TimeTh = styled.th`
  border: 1px solid #333;
  padding: 10px;
  background-color: #444;
  width: 15px;
`;

const Td = styled.td`
  border: 1px solid #333;
  height: 50px;
`;

const TimeColumn = styled.td`
  border: 1px solid #333;
  padding: 10px;
  background-color: #222;
  color: #fff;
  width: 15px;
  text-align: center;
`;

const Input = styled.input`
  background-color: #fff;
  color: #000;
  width: 100%;
  padding: 5px;
  margin-top: 10px;
  border: 1px solid #333;
  border-radius: 4px;
`;


const Select = styled.select`
  background-color: #fff;
  color: #000;
  width: 100%;
  padding: 5px;
  margin-top: 10px;
  border: 1px solid #333;
  border-radius: 4px;

  /* Ensure option text is visible */
  option {
    color: #000;
  }
`;

const Option = styled.option`
    background-color: black;
    color: #000;
    text-color: #000;
`;


const timeSlots = [
  "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
  "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"
];

const Calendar: React.FC = () => {
  return (
    <CalendarContainer>
      <Sidebar>
        <h3>Total Courses: 0</h3>
        <Select>
          <option value="">Select Faculty...</option>
          <option value="MATH">Faculty of Math</option>
        </Select>
        <Input type="text" placeholder="Search..." />
      </Sidebar>
      <Content>
        <Table>
          <thead>
            <tr>
              <TimeTh>Time</TimeTh>
              <Th>Monday</Th>
              <Th>Tuesday</Th>
              <Th>Wednesday</Th>
              <Th>Thursday</Th>
              <Th>Friday</Th>
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, index) => (
              <tr key={index}>
                <TimeColumn>{slot}</TimeColumn>
                <Td></Td>
                <Td></Td>
                <Td></Td>
                <Td></Td>
                <Td></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Content>
    </CalendarContainer>
  );
};

export default Calendar;
