'use client';

import { title } from 'process';
import React, { useState, useEffect, useRef } from 'react';
import { start } from 'repl';
import styled from 'styled-components';
import { format } from 'url';

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
  position: relative;
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
  position: relative;
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

interface EventProps {
  top: number;
  height: number;
}


const Event = styled.div<EventProps>`
  background-color: #f9d342;
  padding: 5px;
  margin: 0;
  border-radius: 4px;
  box-sizing: border-box; /* Include padding and border in element's total width and height */
  overflow: hidden; /* Hide overflow content */
  white-space: nowrap; /* Ensure text doesn't wrap */
  text-overflow: ellipsis; /* Show ellipsis for overflowing text */
  position: absolute;
  left: 5px;
  right: 5px;
  top: ${(props) => props.top}px;
  height: ${(props) => props.height}px;
`;

const timeSlots = [
  "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
  "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"
];

const events = [
  {
    day: "Monday",
    startTime: "10:00 AM",
    endTime: "11:20 AM",
    id: "23011-6",
    title: "MATH 101",
  },
  {
    day: "Wednesday",
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    id: "23011-7",
    title: "MATH 101",
  },
  {
    day: "Friday",
    startTime: "7:00 AM",
    endTime: "10:50 AM",
    id: "23011-8",
    title: "CS 101",
  },
  {
    day: "Thursday",
    startTime: "2:00 PM",
    endTime: "4:20 PM",
    id: "23011-9",
    title: "CS 101",
  },
  {
    day: "Monday",
    startTime: "11:30 AM",
    endTime: "1:00 PM",
    id: "23011-10",
    title: "CS 101",
  }
];

const formatTime = (time: string): number => {
  const [hour, minutePart] = time.split(':');
  const minutes = parseInt(minutePart.substring(0, 2));
  const period = minutePart.substring(2).trim().toUpperCase();
  const hour24 = period === 'PM' && hour !== '12' ? parseInt(hour) + 12 : parseInt(hour);
  return hour24 + minutes / 60;
};

const firstIndex = (startTime: string, timeSlots: string[]) => {
  // return timeSlots.findIndex(time => formatTime(time) >= formatTime(startTime));
  return Math.floor(formatTime(startTime) - formatTime(timeSlots[0]));
}


const Calendar: React.FC = () => {
  const [slotHeight, setSlotHeight] = useState<number>(50); // Default value
  const timeSlotRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (timeSlotRef.current) {
      setSlotHeight(timeSlotRef.current.clientHeight);
    }
  }, []);

  const calculatePosition = (startTime: string, endTime: string, timeSlots: string[]) => {
    const start = formatTime(startTime);
    const end = formatTime(endTime);
    // console.log((start - formatTime(timeSlots[0])) * slotHeight / 1000);
    console.log(start, end, end - start, slotHeight);
    return {
      top: ((formatTime(startTime) - formatTime(timeSlots[0])) - Math.floor(formatTime(startTime) - formatTime(timeSlots[0]))) * slotHeight,
      height: (end - start) * slotHeight
    };
  };

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
                <TimeColumn ref={index === 0 ? timeSlotRef : null}>{timeSlot}</TimeColumn>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
                  <Td key={day}>
                    {events.filter(event => event.day === day && index === firstIndex(event.startTime, timeSlots)).map(event => {
                      const { top, height } = calculatePosition(event.startTime, event.endTime, timeSlots);
                      return (
                        // <EventWrapper key={event.id} top={top} height={height}>
                          <Event key={event.id} top={top} height={height}>
                            <strong>{event.title} - {event.id}</strong>
                            {/* <div>{event.details}</div>
                            <div>{event.description}</div> */}
                            <div>{event.startTime} to {event.endTime}</div>
                          </Event>
                        // </EventWrapper>
                      );
                    })}
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
