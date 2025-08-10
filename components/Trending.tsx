import { AiOutlineFire } from 'react-icons/ai';

const Trending = () => {
  const trendingTopics = [
    {
      id: 1,
      topic: '#TechInnovation',
      posts: 1234,
    },
    {
      id: 2,
      topic: '#RemoteWork',
      posts: 856,
    },
    {
      id: 3,
      topic: '#AI',
      posts: 743,
    },
    {
      id: 4,
      topic: '#StartupLife',
      posts: 521,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center space-x-2 mb-4">
        <AiOutlineFire className="text-xl text-orange-500" />
        {/* <h2 className="text-lg font-semibold">Trending Now</h2> */}
      </div>
      
      <div className="space-y-4">
        {trendingTopics.map((topic) => (
          <div key={topic.id} className="flex items-center justify-between">
            <a
              href="#"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {topic.topic}
            </a>
            <span className="text-sm text-gray-500">{topic.posts} posts</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trending; 