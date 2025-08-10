import Image from 'next/image';
import { AiOutlineLike, AiOutlineComment } from 'react-icons/ai';
import { BiShare } from 'react-icons/bi';

const Feed = () => {
  return (
    <div className="space-y-6">
      {/* Post Creation */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-4">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image
              src="/placeholder-avatar.svg"
              alt="Your profile"
              width={40}
              height={40}
              priority
            />
          </div>
          <input
            type="text"
            placeholder="Share your thoughts..."
            className="flex-1 p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex justify-end mt-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Post
          </button>
        </div>
      </div>

      {/* Sample Posts */}
      {[1, 2].map((post) => (
        <div key={post} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src="/placeholder-avatar.svg"
                alt="User profile"
                width={40}
                height={40}
                priority
              />
            </div>
            <div>
              <h3 className="font-medium">Jane Smith</h3>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
          </div>
          
          <p className="mb-4">
            Just finished an amazing project with my team! #coding #teamwork
          </p>
          
          <div className="flex items-center space-x-6 text-gray-500">
            <button className="flex items-center space-x-2 hover:text-blue-500">
              <AiOutlineLike className="text-xl" />
              <span>Like</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-blue-500">
              <AiOutlineComment className="text-xl" />
              <span>Comment</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-blue-500">
              <BiShare className="text-xl" />
              <span>Share</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Feed; 