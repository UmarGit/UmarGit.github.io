import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";

const firebaseConfig = {
  // Your Firebase configuration object goes here
  // You'll need to replace these placeholder values with your actual Firebase config
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics and export it
let analytics: any = null;

// Only initialize analytics on the client side
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Helper function to log page views
export const logPageView = (pagePath: string, pageTitle: string) => {
  if (analytics) {
    logEvent(analytics, "page_view", {
      page_path: pagePath,
      page_title: pageTitle,
      page_location: window.location.href,
    });
  }
};

// Helper function to log blog post views
export const logBlogView = (slug: string, title: string) => {
  if (analytics) {
    logEvent(analytics, "blog_view", {
      slug,
      title,
      timestamp: new Date().toISOString(),
    });
  }
};

export { analytics };
