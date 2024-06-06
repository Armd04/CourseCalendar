import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { useRouter } from 'next/navigation';
import styles from './styles/Calendar.module.css';
import { get } from 'http';
import { title } from 'process';

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
    if (!user) {
      router.push('/login');
    }
    else {
      const getUser = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/logged-in/`, {
            headers: {
              'Accept': 'application/json',
              'Access-Control-Allow-Origin': '*',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          });
        } catch (error) {
          router.push('/login');
          console.log('Not logged in');
        }
      }
      const getEvents = async () => {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get-schedule/?term=1245`, {
          headers: {
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          }
        });
        for (const course of response.data) {
          handleInitialCourse(course);
        }
      }

      getUser();
      getEvents();

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
    setCourseCode('');
    setLectureSections([]);
    setTutorialSections([]);
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

  const handleInitialCourse = (course: any) => {
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
          courseId: course.courseId,
          title: course.title,
          color: assignedColor
        };
      }).filter((event: any) => event !== null);
    }).flat();
    setEvents((prevEvents) => [...prevEvents, ...newEvents]);
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
          courseId: course.courseId,
          title: `${selectedSubject.toUpperCase()} ${courseCode}`,
          color: assignedColor
        };
      }).filter((event: any) => event !== null);
    }).flat();
    setEvents((prevEvents) => [...prevEvents, ...newEvents]);

    const postData = async () => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/add-course/`, {
        course_id: course.courseId,
        class_number: course.classNumber,
        title: `${selectedSubject.toUpperCase()} ${courseCode}`, 
      }, {
        headers: {
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });
    }

    postData();
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
    const postData = async () => {
      const strEventId = eventId.toString();
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/remove-course/`, {
        course_id: "6",
        class_number: strEventId,
        title: "79",
      }, {
        headers: {
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });
    }

    postData();
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
    <div className={styles['calendar-container']}>
      <div className={styles.sidebar}>
        <Select
          options={subjects}
          placeholder="Faculty ..."
          classNamePrefix="react-select"
          onChange={handleSubjectChange}
        />
        <input
          type="text"
          value={courseCode}
          placeholder="Search..."
          onChange={handleSearch}
          className={styles.input}
        />
        <div className={styles['course-sections-container']}>
          {lectureSections.map((section) => (
            <div
              key={section.classNumber}
              onClick={() => handleCourseSectionClick(section)}
              onMouseEnter={() => handleCourseSectionHover(section)}
              onMouseLeave={handleCourseSectionLeave}
              className={styles['course-section-item']}
            >
              {selectedSubject.toUpperCase()} {courseCode} {section.courseComponent} {section.classSection}
            </div>
          ))}
        </div>
        <div className={styles['course-sections-container']}>
          {tutorialSections.map((section) => (
            <div
              key={section.classNumber}
              onClick={() => handleCourseSectionClick(section)}
              onMouseEnter={() => handleCourseSectionHover(section)}
              onMouseLeave={handleCourseSectionLeave}
              className={styles['course-section-item']}
            >
              {selectedSubject.toUpperCase()} {courseCode} {section.courseComponent} {section.classSection}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.content}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles['time-th']}>Time</th>
              <th className={styles.th}>Monday</th>
              <th className={styles.th}>Tuesday</th>
              <th className={styles.th}>Wednesday</th>
              <th className={styles.th}>Thursday</th>
              <th className={styles.th}>Friday</th>
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((timeSlot, index) => (
              <tr key={index}>
                <td ref={index === 0 ? timeSlotRef : null} className={styles['time-column']}>{timeSlot}</td>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
                  <td key={day} className={styles.td}>
                    {[...events, ...hoveredEvents].filter(event => event.day === day && index === firstIndex(event.startTime, timeSlots)).map(event => {
                      const { top, height } = calculatePosition(event.startTime, event.endTime, timeSlots);
                      return (
                        <div key={event.id} className={styles.event} style={{ top: `${top}px`, height: `${height}px`, backgroundColor: event.color }}>
                          <button className={styles['remove-button']} onClick={() => handleRemoveEvent(event.id)}>x</button>
                          <strong>{event.title} - {event.courseComponent} {event.classSection}</strong><br />
                          {event.startTime} to {event.endTime}
                        </div>
                      );
                    })}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Calendar;
