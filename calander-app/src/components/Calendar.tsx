import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Select from 'react-select';
import { useRouter } from 'next/navigation';

const CalendarContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #fff;
  color: #000;
`;

const Sidebar = styled.div`
  width: 200px;
  background-color: #f0f0f0;
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  height: 100%;
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
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #e0e0e0;
  width: 20%;
`;

const TimeTh = styled.th`
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #e0e0e0;
  width: 15px;
`;

const Td = styled.td`
  border: 1px solid #ccc;
  height: 50px;
  position: relative;
`;

const TimeColumn = styled.td`
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #ffffcc;
  color: #000;
  width: 15px;
  text-align: center;
`;

const Input = styled.input`
  background-color: #fff;
  color: #000;
  width: 100%;
  padding: 5px;
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const StyledSelect = styled(Select)`
  .react-select__control {
    background-color: #fff;
    color: #000;
    border-color: #ccc;
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
  backgroundColor: string;
}

const Event = styled.div<EventProps>`
  background-color: ${(props) => props.backgroundColor};
  padding: 5px;
  margin: 0;
  border-radius: 4px;
  box-sizing: border-box;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  align-items: center;
  text-align: center;
  position: absolute;
  left: 5px;
  right: 5px;
  top: ${(props) => props.top}px;
  height: ${(props) => props.height}px;
  border: 2px solid #555;
`;

const RemoveButton = styled.button`
  background-color: transparent;
  border: none;
  color: #ff4d4d;
  font-size: 12px;
  position: absolute;
  top: 2px;
  right: 2px;
  cursor: pointer;
  z-index: 10;
`;

const CourseSectionsContainer = styled.div`
  background-color: #f0f0f0;
  color: #000;
  padding: 10px;
  margin-top: 10px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex-grow: 1;
  overflow-y: auto;
`;

const CourseSectionItem = styled.div`
  background-color: #ddd;
  padding: 5px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #ccc;
  }
`;

const timeSlots = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"
];

const colors = [
  "#FFCCCC", "#CCCCFF", "#CCFFCC", "#FFDDCC", "#FFCCDD",
  "#DDFFCC", "#CCCCDD", "#CCDDFF", "#FFCCBB", "#BBFFCC"
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
  const [lectureSections, setLectureSections] = useState<any[]>([]);
  const [tutorialSections, setTutorialSections] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [hoveredEvents, setHoveredEvents] = useState<any[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>(colors);
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
        setSubjects(response.data['subjects'].map((subject: string) => ({ id: subject, label: subject, value: subject })));
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
          setLectureSections(lectures);
          setTutorialSections(tutorials);
        } else {
          setLectureSections([]);
          setTutorialSections([]);
        }
      } catch (error) {
        console.error('Failed to fetch course sections:', error);
        setLectureSections([]);
        setTutorialSections([]);
      }
    } else {
      setLectureSections([]);
      setTutorialSections([]);
    }
  };

  const handleCourseSectionClick = (course: any) => {
    const assignedColor = availableColors.shift();
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
          courseComponent: course.courseComponent,
          classSection: course.classSection,
          title: `${selectedSubject.toUpperCase()} ${courseCode}`,
          color: assignedColor
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
          courseComponent: course.courseComponent,
          classSection: course.classSection,
          title: `${selectedSubject.toUpperCase()} ${courseCode}`,
          color: course.color || '#CCCCCC'
        };
      }).filter((event: any) => event !== null);
    }).flat();
    setHoveredEvents(newEvents);
  };

  const handleCourseSectionLeave = () => {
    setHoveredEvents([]);
  };

  const handleRemoveEvent = (eventId: string) => {
    setEvents((prevEvents) => {
      const eventToRemove = prevEvents.find(event => event.id === eventId);
      if (eventToRemove) {
        setAvailableColors([...availableColors, eventToRemove.color]);
      }
      return prevEvents.filter(event => event.id !== eventId);
    });
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
        <Input type="text" placeholder="Search..." onChange={handleSearch} />
        <CourseSectionsContainer>
          {lectureSections.map((section) => (
            <CourseSectionItem
              key={section.classNumber}
              onClick={() => handleCourseSectionClick(section)}
              onMouseEnter={() => handleCourseSectionHover(section)}
              onMouseLeave={handleCourseSectionLeave}
            >
              {selectedSubject.toUpperCase()} {courseCode} {section.courseComponent} {section.classSection}
            </CourseSectionItem>
          ))}
        </CourseSectionsContainer>
        <CourseSectionsContainer>
          {tutorialSections.map((section) => (
            <CourseSectionItem
              key={section.classNumber}
              onClick={() => handleCourseSectionClick(section)}
              onMouseEnter={() => handleCourseSectionHover(section)}
              onMouseLeave={handleCourseSectionLeave}
            >
              {selectedSubject.toUpperCase()} {courseCode} {section.courseComponent} {section.classSection}
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
                        <Event key={event.id} top={top} height={height} backgroundColor={event.color}>
                          <RemoveButton onClick={() => handleRemoveEvent(event.id)}>x</RemoveButton>
                          <strong>{event.title} - {event.courseComponent} {event.classSection}</strong><br/>
                          {event.startTime} to {event.endTime}
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
