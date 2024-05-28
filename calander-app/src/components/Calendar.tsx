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

const events = [
  {
    day: "Monday",
    time: "11:00 AM",
    details: "Meeting with Team",
    id: "23011-6",
    description: "Discuss project milestones"
  },
  {
    day: "Wednesday",
    time: "10:00 AM",
    details: "Code Review",
    id: "23011-7",
    description: "Review latest PRs"
  }
];

const Calendar: React.FC = () => {
  return (
    <CalendarContainer>
      <Sidebar>
        <h3>Total Courses: {events.length}</h3>
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
            {timeSlots.map((timeSlot, index) => (
              <tr key={index}>
                <TimeColumn>{timeSlot}</TimeColumn>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
                  <Td key={day}>
                    {events.filter(event => event.day === day && event.time === timeSlot).map(event => (
                      <div style={{ backgroundColor: "#f9d342", padding: "5px", margin: "5px" }}>
                        <strong>{event.id}</strong>
                        <div>{event.details}</div>
                        <div>{event.description}</div>
                      </div>
                    ))}
                  </Td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </Content>
    </CalendarContainer>
  );
};

export default Calendar;
