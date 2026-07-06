interface UpdateItem {
  _id: string;
  title: string;
  description: string;
  officialUrl: string;
  tags?: string[];
  priority?: number;
}

interface Props {
  title: string;
  updates: UpdateItem[];
}

const UpdatesList: React.FC<Props> = ({ title, updates }) => {
  if (!updates.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">
        {title}
      </h3>

      {updates.map((update) => (
        <a
          key={update._id}
          href={`https://www.google.com/search?q=${encodeURIComponent(update.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl border border-gray-200 p-3 hover:bg-gray-50 transition"
        >
          {/* Title + priority */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
              {update.title}
            </p>

            {update.priority === 1 && (
              <span className="text-xs shrink-0 text-red-600 font-semibold">
                🔥
              </span>
            )}
          </div>

          {/* Description */}
          {update.description && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
              {update.description}
            </p>
          )}

          {/* Tags */}
          {update.tags && update.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {update.tags.slice(0, 4).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-medium text-cyan-700"
                >
                  {tag}
                </span>
              ))}

              {update.tags.length > 4 && (
                <span className="text-[10px] text-gray-400">
                  +{update.tags.length - 4}
                </span>
              )}
            </div>
          )}
        </a>
      ))}
    </div>
  );
};

export default UpdatesList;
