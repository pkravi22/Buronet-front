import Image from 'next/image';

const PostSectionOld = () => {
  return (
    // Make container fluid with horizontal padding for smaller screens
    <div className="flex justify-center w-full px-4 sm:px-0">
      {/* Set a max-width for content readability on larger screens */}
      <div className="mt-6 w-full max-w-[640px] space-y-6">
        {/* First Post */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-4 py-6 sm:px-6">
            {/* User Info */}
            <div className="flex justify-between items-start">
              <div className="flex">
                <div className="w-12 h-12 shrink-0">
                  <Image
                    src="/sarah-johnson.jpg"
                    alt="Sarah Johnson"
                    width={48}
                    height={48}
                    className="rounded-lg"
                  />
                </div>
                <div className="ml-4">
                  <div className="flex items-center flex-wrap">
                    <h3 className="text-[#1F2937] font-medium text-base">Sarah Johnson</h3>
                    <span className="ml-0 mt-1 sm:ml-2 sm:mt-0 text-[#2563EB] text-sm bg-[#EFF6FF] px-2 py-0.5 rounded-lg">
                      Industry Expert
                    </span>
                  </div>
                  <p className="text-[#6B7280] text-sm mt-1">Senior Product Designer at TechCorp</p>
                </div>
              </div>
              <div className="flex items-center text-[#9CA3AF] text-sm shrink-0 ml-2">
                <span>2h ago</span>
                <button className="ml-2 p-2 hover:bg-gray-50 rounded">
                  <svg className="w-3.5 h-0.5" viewBox="0 0 14 4" fill="currentColor">
                    <circle cx="2" cy="2" r="2" />
                    <circle cx="7" cy="2" r="2" />
                    <circle cx="12" cy="2" r="2" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Post Content */}
            <div className="mt-6">
              <h4 className="text-[#1F2937] text-xl font-semibold leading-7">
                Revolutionizing User Experience: Our Latest Design System
              </h4>
              <p className="mt-4 text-[#4B5563] text-base leading-6">
                Excited to share our team's latest innovation in design systems. We've focused on accessibility, performance, and scalability to create something truly special.
              </p>
            </div>

            {/* Post Image */}
            <div className="mt-6 bg-[#F9FAFB] rounded-lg p-2 sm:p-4">
              <Image
                src="/design-system-preview.jpg"
                alt="Design System Preview"
                width={560}
                height={373}
                className="rounded-lg w-full h-auto"
              />
            </div>

            {/* Post Actions: Make them wrap on very small screens */}
            <div className="mt-6 flex flex-wrap justify-between gap-4">
              <div className="flex space-x-6">
                <button className="flex items-center text-[#4B5563] text-sm">
                  <svg className="w-3.5 h-3.5 mr-2" viewBox="0 0 14 12" fill="currentColor">
                    <path d="M7 12l-1.2-1.1C2.3 7.9 0 5.9 0 3.5 0 1.5 1.5 0 3.5 0 4.6 0 5.7 0.5 6.4 1.3L7 2l0.6-0.7C8.3 0.5 9.4 0 10.5 0 12.5 0 14 1.5 14 3.5c0 2.4-2.3 4.4-5.8 7.4L7 12z" />
                  </svg>
                  <span>Like (142)</span>
                </button>
                <button className="flex items-center text-[#4B5563] text-sm">
                  <svg className="w-3.5 h-3.5 mr-2" viewBox="0 0 14 12" fill="currentColor">
                    <path d="M12 0H2C0.9 0 0 0.9 0 2V7C0 8.1 0.9 9 2 9H10L14 12V2C14 0.9 13.1 0 12 0Z" />
                  </svg>
                  <span>Discuss (24)</span>
                </button>
              </div>
              <div className="flex space-x-4">
                <button className="flex items-center text-[#4B5563] text-sm">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 2v12l6-3 6 3V2H2zm12-1H2C1.45 1 1 1.45 1 2v12c0 .55.45 1 1 1l6-3 6 3c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1z"/>
                  </svg>
                  <span>Bookmark</span>
                </button>
                <button className="flex items-center text-[#4B5563] text-sm">
                  <svg className="w-4 h-3.5 mr-2" viewBox="0 0 16 14" fill="currentColor">
                    <path d="M14 6L8 0V4C3 5 0 8 0 14C2 11 4 9.9 8 9.9V14L14 8L16 7L14 6Z" />
                  </svg>
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="bg-[#F3F4F6] text-[#4B5563] text-sm px-3 py-1 rounded-lg">
                #DesignSystems
              </span>
              <span className="bg-[#F3F4F6] text-[#4B5563] text-sm px-3 py-1 rounded-lg">
                #UXInnovation
              </span>
              <span className="bg-[#F3F4F6] text-[#4B5563] text-sm px-3 py-1 rounded-lg">
                #ProductDesign
              </span>
            </div>
          </div>
        </div>

        {/* Second Post (Similar responsive changes should be applied) */}
        <div className="bg-white rounded-xl shadow-sm">
           {/* Apply the same responsive classes to the second post as the first... */}
        </div>
      </div>
    </div>
  );
};

export default PostSectionOld;