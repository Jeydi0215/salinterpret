// src/services/analyticsService.js
import { getFirestore, collection, getDocs, query } from "firebase/firestore";

const db = getFirestore();

export const getQuizAnalytics = async () => {
  try {
    const q = query(collection(db, "quizAnalytics"));
    const querySnapshot = await getDocs(q);
    const analyticsData = querySnapshot.docs.map((doc) => doc.data());

    return analyticsData;
  } catch (error) {
    console.error("Error fetching analytics data: ", error);
    return [];
  }
};
