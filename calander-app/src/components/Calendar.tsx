import axios from 'axios';
import React, { useState, useEffect, useRef, use } from 'react';
import styled from 'styled-components';
import Select from 'react-select';
import { useRouter } from 'next/navigation';

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
  display: flex; // Changed to flex to manage children flexibly
  flex-direction: column; // Children are stacked vertically
  height: 100%; // Fill the parent height
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

const StyledSelect = styled(Select)`
  .react-select__control {
    background-color: #fff;
    color: #000;
    border-color: #333;
    border-radius: 4px;
    margin-top: 10px;
  }
  .react-select__menu {
    background-color: #fff;
    color: #000;
  }
  .react-select__option {
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
  align-items: center;
  text-align: center;
  position: absolute;
  left: 5px;
  right: 5px;
  top: ${(props) => props.top}px;
  height: ${(props) => props.height}px;
`;

const CourseSectionsContainer = styled.div`
  background-color: #282828;
  color: #fff;
  padding: 10px;
  margin-top: 10px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex-grow: 1; // Takes up all available space
  overflow-y: auto; // Enable vertical scrolling
`;

const CourseSectionItem = styled.div`
  background-color: #333;
  padding: 5px;
  border-radius: 4px;
  cursor: pointer; // Add cursor pointer to indicate clickable
  &:hover {
    background-color: #444;
  }
`;

const timeSlots = [
  "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
  "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"
];

const formatTime = (time: string): number => {
  const [hour, minutePart] = time.split(':');
  const minutes = parseInt(minutePart.substring(0, 2));
  const period = minutePart.substring(2).trim().toUpperCase();
  const hour24 = period === 'PM' && hour !== '12' ? parseInt(hour) + 12 : parseInt(hour);
  return hour24 + minutes / 60;
};

const firstIndex = (startTime: string, timeSlots: string[]) => {
  return Math.floor(formatTime(startTime) - formatTime(timeSlots[0]));
}

const Calendar: React.FC = () => {
  const [slotHeight, setSlotHeight] = useState<number>(50);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [courseCode, setCourseCode] = useState<string>('');
  const [courseSections, setCourseSections] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [hoveredEvents, setHoveredEvents] = useState<any[]>([]);
  const timeSlotRef = useRef<HTMLTableCellElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (timeSlotRef.current) {
      setSlotHeight(timeSlotRef.current.clientHeight);
    }
  }, []);

  useEffect(() => {
    const user = localStorage.getItem('accessToken');
    console.log(user);
    if (!user) {
      router.push('/login');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get-subjects/`, {
          headers: {
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
        setSubjects(response.data['subjects'].map((subject: string) => ({id: subject, label: subject, value: subject})));
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log(error.message);
        } else {
          console.log('An unexpected error occurred');
        }
      }
    };

    fetchData();
  }, []);

  const handleSubjectChange = (selectedOption: any) => {
    setSelectedSubject(selectedOption.value);
  };

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputCode = event.target.value;
    setCourseCode(inputCode);
    if (selectedSubject && inputCode) {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/class/?term=1245&subject=${selectedSubject}&catalog_number=${inputCode}`);
        if (response.data.length > 0) {
          const lectures = response.data.filter((course: any) => course.courseComponent === 'LEC');
          const tutorials = response.data.filter((section: any) => section.courseComponent === 'TUT');
          setCourseSections(lectures);
        } else {
          setCourseSections([]); // Clear course sections if no data is returned
        }
      } catch (error) {
        console.error('Failed to fetch course sections:', error);
        setCourseSections([]); // Clear course sections if there's an error
      }
    } else {
      setCourseSections([]); // Clear course sections if subject or course code is not provided
    }
  };

  const handleCourseSectionClick = (course: any) => {
    const newEvents = course.scheduleData.map((schedule: any) => {
      const days = schedule.classMeetingDayPatternCode.split('');
      return days.map((day: string) => {
        if (day === 'N') return null;
        const startTime = new Date(schedule.classMeetingStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(schedule.classMeetingEndTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return {
          day: day === 'M' ? 'Monday' :
               day === 'T' ? 'Tuesday' :
               day === 'W' ? 'Wednesday' :
               day === 'R' ? 'Thursday' :
               day === 'F' ? 'Friday' : '',
          startTime: startTime,
          endTime: endTime,
          id: course.classNumber,
          title: `${selectedSubject.toUpperCase()} ${courseCode}`
        };
      }).filter((event: any) => event !== null);
    }).flat();
    setEvents((prevEvents) => [...prevEvents, ...newEvents]);
  };

  const handleCourseSectionHover = (course: any) => {
    const newEvents = course.scheduleData.map((schedule: any) => {
      const days = schedule.classMeetingDayPatternCode.split('');
      return days.map((day: string) => {
        if (day === 'N') return null;
        const startTime = new Date(schedule.classMeetingStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(schedule.classMeetingEndTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return {
          day: day === 'M' ? 'Monday' :
               day === 'T' ? 'Tuesday' :
               day === 'W' ? 'Wednesday' :
               day === 'R' ? 'Thursday' :
               day === 'F' ? 'Friday' : '',
          startTime: startTime,
          endTime: endTime,
          id: course.classNumber,
          title: `${selectedSubject.toUpperCase()} ${courseCode}`
        };
      }).filter((event: any) => event !== null);
    }).flat();
    setHoveredEvents(newEvents);
  };

  const handleCourseSectionLeave = () => {
    setHoveredEvents([]);
  };

  const calculatePosition = (startTime: string, endTime: string, timeSlots: string[]) => {
    const start = formatTime(startTime);
    const end = formatTime(endTime);
    return {
      top: ((formatTime(startTime) - formatTime(timeSlots[0])) - Math.floor(formatTime(startTime) - formatTime(timeSlots[0]))) * slotHeight,
      height: (end - start) * slotHeight
    };
  };

  return (
    <CalendarContainer>
      <Sidebar>
        <StyledSelect
          options={subjects}
          placeholder="Faculty ..."
          classNamePrefix="react-select"
          onChange={handleSubjectChange}
        />
        <Input type="text" placeholder="Search..." onChange={handleSearch}/>
        <CourseSectionsContainer>
          {courseSections.map((section) => (
            <CourseSectionItem
              key={section.classNumber}
              onClick={() => handleCourseSectionClick(section)}
              onMouseEnter={() => handleCourseSectionHover(section)}
              onMouseLeave={handleCourseSectionLeave}
            >
              {selectedSubject.toUpperCase()} {courseCode} {section.classNumber}
            </CourseSectionItem>
          ))}
        </CourseSectionsContainer>
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
                    {[...events, ...hoveredEvents].filter(event => event.day === day && index === firstIndex(event.startTime, timeSlots)).map(event => {
                      const { top, height } = calculatePosition(event.startTime, event.endTime, timeSlots);
                      return (
                        <Event key={event.id} top={top} height={height}>
                          <strong>{event.title} - {event.id}</strong>
                          <div>{event.startTime} to {event.endTime}</div>
                        </Event>
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
