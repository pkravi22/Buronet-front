// 'use client';

// import React, { useState, useEffect } from 'react';
// import AppLayout from '../../components/AppLayout';
// import LoadingSpinner from '../../components/UI/LoadingSpinner';
// import { useAuth, withAuthRequired } from '../../context/AuthContext';
// import { formatDistanceToNow, parseISO } from 'date-fns';

// // Define the type for a single current affair item, based on the API response structure.
// interface CurrentAffair {
//   _id: string;
//   news: string;
//   date: string; // ISO 8601 date string
//   description: string;
//   url: string;
//   publishedAt: string; // ISO 8601 date string
// }

// const CurrentAffairsPage: React.FC = () => {
//   const [affairs, setAffairs] = useState<CurrentAffair[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // A custom API key is required to make a call to RapidAPI. This key would typically be
//   // stored in a secure environment variable and passed to the frontend.
//   // We'll leave it empty for now, as you must provide your own key.
//   const RAPIDAPI_KEY = "33902549dbmshe2f863ef1542a6ap1db9a4jsnea0ea08e0c05"; 
//   const RAPIDAPI_HOST = 'current-affairs-of-india.p.rapidapi.com';

//   useEffect(() => {
//     const fetchCurrentAffairs = async () => {
//       // Exit early if no API key is provided
//       if (!RAPIDAPI_KEY) {
//         setError('RapidAPI key is not configured. Please add your key to proceed.');
//         setIsLoading(false);
//         return;
//       }
      
//       setIsLoading(true);
//       setError(null);

//       const options = {
//         method: 'GET',
//         headers: {
//         },
//       };

//       try {
//         // const response = await fetch('https://newsapi.org/v2/top-headlines?sources=google-news-in,the-hindu,the-times-of-india&apiKey=f6719dee71aa4664bca1082aa8e98438', options);
//         const response = await fetch('https://newsapi.org/v2/everything?q=india exams&apiKey=f6719dee71aa4664bca1082aa8e98438', options);
//         // console.log("API response:", response); // Log the response status
//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || `API Error: ${response.status}`);
//         }
//         const data = await response.json();
//         console.log("API data:", data); // Log the fetched data
//         if (data && data.articles && Array.isArray(data.articles)) {
//           const sortedArticles = data.articles.sort((a:any, b:any) => {
//             return new Date(b.publishedAt) - new Date(a.publishedAt);
//           });
//           setAffairs(sortedArticles);
//           console.log("Fetched Affairs: ", sortedArticles);

//         } else {
//           throw new Error('Invalid data format received from API.');
//         }
//       } catch (err: any) {
//         console.error('Error fetching current affairs:', err);
//         setError(err.message || 'Failed to fetch current affairs.');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchCurrentAffairs();
//   }, [RAPIDAPI_KEY]);

//   const formatTimeAgo = (dateString: string) => {
//     try {
//       const date = parseISO(dateString);
//       return formatDistanceToNow(date, { addSuffix: true });
//     } catch {
//       return 'N/A';
//     }
//   };

//   if (isLoading) {
//     return (
//       <AppLayout>
//         <div className="flex justify-center items-center h-[calc(100vh-64px)]">
//           <LoadingSpinner /> <span className="ml-2 text-gray-700">Loading current affairs...</span>
//         </div>
//       </AppLayout>
//     );
//   }

//   if (error) {
//     return (
//       <AppLayout>
//         <div className="text-red-600 text-center py-8 px-4">
//           <p>Error loading current affairs: {error}</p>
//           <p className="mt-4 text-gray-700 text-sm">Please check your network and API key configuration.</p>
//         </div>
//       </AppLayout>
//     );
//   }

//   if (affairs.length === 0) {
//     return (
//       <AppLayout>
//         <div className="text-center py-8 text-gray-700 px-4">
//           <p>No current affairs available at this time.</p>
//         </div>
//       </AppLayout>
//     );
//   }

//   return (
//     <AppLayout>
//       <div className="min-h-screen bg-[#EEF0F4] py-8">
//         <div className="max-w-7xl mx-auto px-4 lg:px-8">
//           <h1 className="text-3xl font-bold mb-8">
//             Current Affairs of India
//           </h1>
//           <div className="space-y-6">
//             {affairs.map((item) => (
//               <div key={item._id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
//                 <h2 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
//                   {item.news}
//                 </h2>
//                 <div className="flex items-center text-gray-500 text-sm mb-4">
//                   <p>Published: {formatTimeAgo(item.publishedAt)}</p>
//                 </div>
//                 <p className="text-gray-700 leading-relaxed mb-4">
//                   {item.description}
//                 </p>
//                 <a
//                   href={item.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="inline-flex items-center text-blue-600 hover:underline font-medium transition"
//                 >
//                   Read more
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
//                   </svg>
//                 </a>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </AppLayout>
//   );
// };

// export default withAuthRequired(CurrentAffairsPage);

// app/current-affairs/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useAuth, withAuthRequired } from '../../context/AuthContext';
import { formatDistanceToNow, parseISO } from 'date-fns';
import Image from 'next/image'; // Import the Image component

// Define the type for a single current affair item, based on the API response structure.
// NOTE: I've updated this interface based on the NewsAPI response you're now using.
interface CurrentAffair {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string; // ISO 8601 date string
  content: string;
}

const CurrentAffairsPage: React.FC = () => {
  const [affairs, setAffairs] = useState<CurrentAffair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // A custom API key is required to make a call to NewsAPI. This key would typically be
  // stored in a secure environment variable and passed to the frontend.
  const NEWS_API_KEY = "f6719dee71aa4664bca1082aa8e98438"; 

  useEffect(() => {
    const fetchCurrentAffairs = async () => {
      // Exit early if no API key is provided
      if (!NEWS_API_KEY) {
        setError('NewsAPI key is not configured. Please add your key to proceed.');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);

      const options = {
        method: 'GET',
        headers: {
          'X-Api-Key': NEWS_API_KEY, // Use X-Api-Key for NewsAPI
        },
      };

      try {
        var searchKeywords = ['government jobs india','india exams'];
        var articles = []
        for(const keyword of searchKeywords) {
            const response = await fetch(`https://newsapi.org/v2/everything?q=${keyword}&pageSize=20`, options);
            if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `API Error: ${response.status}`);
            }
            const data = await response.json();
            if (data && data.articles && Array.isArray(data.articles)) {
            articles.push(...data.articles)
            } else {
            throw new Error('Invalid data format received from API.');
            }
        }
        const sortedArticles = articles.sort((a:any, b:any) => {
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
          });
        console.log("sorted", sortedArticles);
        setAffairs(sortedArticles);
      } catch (err: any) {
        console.error('Error fetching current affairs:', err);
        setError(err.message || 'Failed to fetch current affairs.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentAffairs();
  }, [NEWS_API_KEY]);

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <LoadingSpinner /> <span className="ml-2 text-gray-700">Loading latest news...</span>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="text-red-600 text-center py-8 px-4">
          <p>Error loading latest news: {error}</p>
          <p className="mt-4 text-gray-700 text-sm">Please check your network and API key configuration.</p>
        </div>
      </AppLayout>
    );
  }

  if (affairs.length === 0) {
    return (
      <AppLayout>
        <div className="text-center py-8 text-gray-700 px-4">
          <p>No news available at this time.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#EEF0F4] mt-8 py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">
            Latest News from India
          </h1>
          {/* Renders as a responsive grid of cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {affairs.map((item) => (
              <div key={item.url} className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow flex flex-col">
                {/* Optional Image */}
                {item.urlToImage && (
                  <div className="relative w-full h-48 rounded-t-xl overflow-hidden">
                    <Image
                    //   src='https://placehold.co/600x600'
                      src={item.urlToImage}
                      alt={item.title}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-semibold text-gray-900 leading-tight mb-4 line-clamp-2">
                    {item.title}
                  </h2>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <p>Source: {item.source.name}</p>
                    <span className="mx-2">&middot;</span>
                    <p>Published: {formatTimeAgo(item.publishedAt)}</p>
                  </div>
                  {/* <p className="text-gray-700 leading-relaxed text-sm mb-4">
                    {item.description}
                  </p> */}
                  <p className="text-gray-700 leading-relaxed text-sm mb-4 line-clamp-4">
                    {item.description}
                  </p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center text-blue-600 hover:underline font-medium transition"
                  >
                    Read more
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default withAuthRequired(CurrentAffairsPage);
