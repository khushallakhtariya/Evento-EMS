import React from "react";

const FeedbackList = ({ feedbackList, handleDelete }) => {
  return (
    <div className="w-full lg:w-1/2 bg-white p-8 rounded-lg shadow-md transition-all duration-300 max-h-full">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center transition-transform duration-200">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400">
          Submitted Feedback
        </span>
        <span className="ml-3 bg-indigo-600 text-white text-sm font-medium rounded-full px-3 py-1 transition-colors duration-200">
          {feedbackList.length}
        </span>
      </h2>
      {feedbackList.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-gray-100">
          {feedbackList.map((feedback, index) => (
            <div
              key={index}
              className="p-4 border rounded-md shadow-sm bg-gray-50 transition-all duration-200"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="font-bold text-lg transition-colors duration-200">
                    {feedback.name}
                  </div>
                  <div className="ml-2 text-sm text-gray-500 transition-colors duration-200">
                    {feedback.email}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <div className="flex items-center">
                    <div className="mr-2 text-sm font-medium text-gray-700">
                      Rating:
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`w-7 h-7 text-xl ${
                            feedback.rating >= star
                              ? "text-yellow-500"
                              : "text-gray-300"
                          } transition-colors duration-200`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-700 mb-2 font-medium transition-colors duration-200">
                Event: {feedback.event}
              </div>
              <div className="text-sm mb-4 bg-white p-3 rounded border border-gray-100 transition-colors duration-200">
                {feedback.message}
              </div>
              <div className="flex justify-end">
                {/* <button
                  onClick={() => handleDelete(index)}
                  className="text-white bg-red-500 text-sm px-3 py-1 rounded-md transition-all duration-200 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </button> */}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg transition-all duration-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 transition-colors duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500 transition-colors duration-200">
            No feedback submitted yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;
