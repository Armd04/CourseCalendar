import axios from 'axios';
import React, { useState, useEffect, useRef, use } from 'react';
import Select from 'react-select';
import { useRouter } from 'next/navigation';
import styles from './styles/Calendar.module.css';
import Image from 'next/image';
import WaterlooLogo from './styles/WaterlooLogoLight.png';
import { get } from 'http';

function numberToColor(number: number): string {
  if (number < 1 || number > 100000) {
    throw new Error("Number must be between 1 and 100000");
  }
  const hue = number % 360;
  
  // For consistent saturation and lightness, use fixed values
  const saturation = 70;
  const lightness = 50;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

const timeSlots = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"
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
  const defaultTerm = { id: '1245', label: 'Spring 2024', value: '1245' };

  const [slotHeight, setSlotHeight] = useState<number>(50);
  const [terms, setTerms] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>();
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [courseCode, setCourseCode] = useState<string>('');
  const [lectureSections, setLectureSections] = useState<any[]>([]);
  const [tutorialSections, setTutorialSections] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [hoveredEvents, setHoveredEvents] = useState<any[]>([]);
  const timeSlotRef = useRef<HTMLTableCellElement>(null);
  const router = useRouter();
  const selectRef = useRef<any>(null);

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
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get-schedule/?term=${selectedTerm}`, {
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
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get-terms/`, {
          headers: {
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
        const fetchedTerms = response.data['terms'].map((term: any) => ({ id: term.termCode, label: term.name, value: term.termCode }));
        setTerms(fetchedTerms);


        const defaultTermFromResponse = fetchedTerms.find((term: any) => term.id === defaultTerm.id);
        if (defaultTermFromResponse) {

          setSelectedTerm(defaultTermFromResponse.id);

          if (selectRef.current) {
            selectRef.current.setValue(defaultTermFromResponse);
          }
        }
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

  useEffect(() => {
    console.log(selectedTerm);
    if (selectedTerm) {
      setCourseCode('');
      setLectureSections([]);
      setTutorialSections([]);
      setEvents([]);
      setHoveredEvents([]);
      reloadEvents();
    }
  }, [selectedTerm]);

  const handleTermChange = async (selectedOption: any) => {
    setSelectedTerm(selectedOption.value);
  };

  const handleSubjectChange = (selectedOption: any) => {
    setSelectedSubject(selectedOption.value);
    setCourseCode('');
    setLectureSections([]);
    setTutorialSections([]);
  };


  const reloadEvents = () => {
    const getEvents = async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get-schedule/?term=${selectedTerm}`, {
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
    getEvents();
  }

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputCode = event.target.value;
    setCourseCode(inputCode);
    if (selectedSubject && inputCode) {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/class/?term=${selectedTerm}&subject=${selectedSubject}&catalog_number=${inputCode}`);
        if (response.data.length > 0) {
          const lectures = response.data.filter((course: any) => course.courseComponent === 'LEC');
          for (let i = 0; i < lectures.length; ++i){
            const EnrolledResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get-enrolled/?term=${selectedTerm}&course_id=${lectures[i].courseId}&class_number=${lectures[i].classNumber}`);
            lectures[i] = {
              ...lectures[i],
              ...EnrolledResponse.data
            };
          }
          const tutorials = response.data.filter((section: any) => section.courseComponent === 'TUT' || section.courseComponent === 'LAB');
          for (let i = 0; i < tutorials.length; ++i){
            const EnrolledResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get-enrolled/?term=${selectedTerm}&course_id=${tutorials[i].courseId}&class_number=${tutorials[i].classNumber}`);
            tutorials[i] = {
              ...tutorials[i],
              ...EnrolledResponse.data
            };
          }

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
          enrolledStudents: course.enrolledStudents,
          maxEnrollmentCapacity: course.maxEnrollmentCapacity,
        };
      }).filter((event: any) => event !== null);
    }).flat();
    setEvents((prevEvents) => [...prevEvents, ...newEvents]);
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
          courseComponent: course.courseComponent,
          classSection: course.classSection,
          courseId: course.courseId,
          enrolledStudents: course.enrolledStudents,
          maxEnrollmentCapacity: course.maxEnrollmentCapacity,
          title: `${selectedSubject.toUpperCase()} ${courseCode}`,
          color: numberToColor(course.classNumber)
        };
      }).filter((event: any) => event !== null);
    }).flat();

    const checkConflict = () => {
      for (const newEvent of newEvents) {
        const sameDayEvents = events.filter(event => event.day === newEvent.day);
        for (const event of sameDayEvents) {
          if (formatTime(newEvent.startTime) < formatTime(event.endTime) && formatTime(newEvent.endTime) > formatTime(event.startTime)) {
            return false;
          }
        }
      }
      return true;
    }

    const checkRepeat = () => {
      for (const event of events) {
        if (event.id === course.classNumber) {
          return false;
        }
      }
      return true;
    }

    const postData = async () => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/add-course/`, {
        course_id: course.courseId,
        class_number: course.classNumber,
        title: `${selectedSubject.toUpperCase()} ${courseCode}`, 
        term: selectedTerm,
      }, {
        headers: {
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });
    }

    const checkConflictResult = checkConflict();
    const checkRepeatResult = checkRepeat();

    if (!checkRepeatResult) {
      return;
    }

    if (checkConflictResult) {
      setEvents((prevEvents) => [...prevEvents, ...newEvents]);
      postData();
    }
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
          enrolledStudents: course.enrolledStudents,
          maxEnrollmentCapacity: course.maxEnrollmentCapacity,
          title: `${selectedSubject.toUpperCase()} ${courseCode}`,
          color: '#CCCCCC'
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
      return prevEvents.filter(event => event.id !== eventId);
    });
    const postData = async () => {
      const strEventId = eventId.toString();
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/remove-course/`, {
        course_id: "6",
        class_number: strEventId,
        title: "79",
        term: "1245",
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
    <div className={`d-flex ${styles['calendar-container']}`}>
      <div className={`d-flex flex-column align-items-center ${styles.sidebar}`}>
        <div className={styles.logoContainer}>
          <Image 
            src={WaterlooLogo} 
            alt="Waterloo Logo" 
            priority 
            width={100} 
            height={100} 
            style={{ width: 'auto', height: 'auto' }} 
          />
        </div>
        <Select
          ref={selectRef}
          options={terms}
          placeholder="Term..."
          onChange={handleTermChange}
          className={`w-100 mt-3 ${styles.select}`}
        />
        <Select
          options={subjects}
          placeholder="Subject..."
          onChange={handleSubjectChange}
          className={`w-100 mt-3 ${styles.select}`}
        />
        <input
          type="text"
          value={courseCode}
          placeholder="Code..."
          onChange={handleSearch}
          className={`form-control mt-3 ${styles.input}`}
        />
        <div className="d-flex flex-column flex-grow-1 w-100">
          <div className={`flex-grow-1 ${styles['course-sections-container']} mt-3`}>
            {lectureSections.map((section) => (
              <div
                key={section.classNumber}
                onClick={() => handleCourseSectionClick(section)}
                onMouseEnter={() => handleCourseSectionHover(section)}
                onMouseLeave={handleCourseSectionLeave}
                className={`p-2 my-2 ${styles['course-section-item']}`}
              >
                {selectedSubject.toUpperCase()} {courseCode} {section.courseComponent} {section.classSection}
              </div>
            ))}
          </div>
          <div className={`flex-grow-1 ${styles['course-sections-container']} mt-3`}>
            {tutorialSections.map((section) => (
              <div
                key={section.classNumber}
                onClick={() => handleCourseSectionClick(section)}
                onMouseEnter={() => handleCourseSectionHover(section)}
                onMouseLeave={handleCourseSectionLeave}
                className={`p-2 my-2 ${styles['course-section-item']}`}
              >
                {selectedSubject.toUpperCase()} {courseCode} {section.courseComponent} {section.classSection}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={`flex-grow-1 p-3 ${styles.content}`}>
        <table className={`${styles.table}`}>
          <thead>
            <tr>
              <th className={`text-center ${styles['time-th']}`}>Time</th>
              <th className={`text-center ${styles.th}`}>Monday</th>
              <th className={`text-center ${styles.th}`}>Tuesday</th>
              <th className={`text-center ${styles.th}`}>Wednesday</th>
              <th className={`text-center ${styles.th}`}>Thursday</th>
              <th className={`text-center ${styles.th}`}>Friday</th>
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
                        <div key={event.id} className={styles.event} style={{ top: `${top}px`, height: `${height}px`, backgroundColor: event.color || "#CCCCC"}}>
                          <button className={styles['remove-button']} onClick={() => handleRemoveEvent(event.id)}>x</button>
                          <strong>{event.title} - {event.courseComponent} {event.classSection} - {event.enrolledStudents}/{event.maxEnrollmentCapacity}</strong><br />
                          {event.startTime} to {event.endTime}<br />
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