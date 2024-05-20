import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Schedule Data Interface
interface ScheduleData {
    courseId: string;
    courseOfferNumber: number;
    sessionCode: string;
    classSection: number;
    termCode: string;
    classMeetingNumber: number;
    scheduleStartDate: string;
    scheduleEndDate: string;
    classMeetingStartTime: string;
    classMeetingEndTime: string;
    classMeetingDayPatternCode: string;
    classMeetingWeekPatternCode: string;
    locationName: string | null;
}

// Instructor Data Interface
interface InstructorData {
    courseId: string;
    courseOfferNumber: number;
    sessionCode: string;
    classSection: number;
    termCode: string;
    instructorRoleCode: string | null;
    instructorFirstName: string | null;
    instructorLastName: string | null;
    instructorUniqueIdentifier: string | null;
    classMeetingNumber: number;
}

// Main Course Data Interface
interface CourseData {
    courseId: string;
    courseOfferNumber: number;
    sessionCode: string;
    classSection: number;
    termCode: string;
    classNumber: number;
    courseComponent: string;
    associatedClassCode: number;
    maxEnrollmentCapacity: number;
    enrolledStudents: number;
    enrollConsentCode: string;
    enrollConsentDescription: string;
    dropConsentCode: string;
    dropConsentDescription: string;
    scheduleData: ScheduleData[];
    instructorData: InstructorData[];
}

// API Response Interface
// interface ApiResponse extends Array<CourseData> {}
type ApiResponse = CourseData[];
// type ApiResponse = string[];



const Test: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ApiResponse>('http://localhost:8000/api/class?term=1241&id=000004', {
          headers: {
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*', // This header is usually controlled by the server
          }
        });
        setData(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.message);
        } else {
          setError('An unexpected error occurred');
        }
      }
    };

    fetchData();
  }, []);
  console.log(data);
  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Data from API:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default Test;
