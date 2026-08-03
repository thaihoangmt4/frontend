import { axiosClient } from "@/lib/axios";
import type {
  CourseDetail,
  GetCoursesResponse,
  LessonDetail,
} from "./types";

const COURSES_URL = "/api/courses";
const LESSONS_URL = "/api/lessons";

export const learningCatalogService = {
  async getCourses(signal?: AbortSignal): Promise<GetCoursesResponse> {
    const { data } = await axiosClient.get<GetCoursesResponse>(COURSES_URL, {
      signal,
    });
    return data;
  },

  async getCourseById(
    courseId: string,
    signal?: AbortSignal,
  ): Promise<CourseDetail> {
    const { data } = await axiosClient.get<CourseDetail>(
      `${COURSES_URL}/${encodeURIComponent(courseId)}`,
      { signal },
    );
    return data;
  },

  async getLessonById(
    lessonId: string,
    signal?: AbortSignal,
  ): Promise<LessonDetail> {
    const { data } = await axiosClient.get<LessonDetail>(
      `${LESSONS_URL}/${encodeURIComponent(lessonId)}`,
      { signal },
    );
    return data;
  },
};
