import { useState } from "react";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const waitTimeCards = [
    {
      id: 1,
      title: "Outpatient (OPD)",
      waitTime: 25,
      unit: "mins",
      description: "Current Wait Time",
      progress: 45,
      color: "primary",
    },
    {
      id: 2,
      title: "General Check-in",
      waitTime: 15,
      unit: "mins",
      description: "Current Wait Time",
      progress: 25,
      color: "green",
    },
    {
      id: 3,
      title: "Emergency Room",
      waitTime: 45,
      unit: "mins",
      description: "Critical Wait Time",
      progress: 75,
      color: "red",
    },
  ];

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Map Section */}
      <div className="w-1/3 flex flex-col border-r border-gray-700/50">
        <div className="p-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="text-gray-400"
                fill="currentColor"
                height="20"
                viewBox="0 0 256 256"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
            </div>
            <input
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-background-dark/50 text-white placeholder-gray-400 border border-gray-700/50 focus:ring-primary focus:border-primary"
              placeholder="Search location..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Map Container */}
        <div
          className="flex-1 bg-cover bg-center relative"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop")',
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Map Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <div className="flex flex-col rounded-lg overflow-hidden bg-background-dark/80 backdrop-blur-sm shadow-xl">
              <button className="p-2.5 hover:bg-primary/20 transition-colors text-white">
                <svg
                  fill="currentColor"
                  height="20"
                  viewBox="0 0 256 256"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                </svg>
              </button>
              <div className="h-px bg-gray-600/50"></div>
              <button className="p-2.5 hover:bg-primary/20 transition-colors text-white">
                <svg
                  fill="currentColor"
                  height="20"
                  viewBox="0 0 256 256"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z"></path>
                </svg>
              </button>
            </div>
            <button className="p-2.5 rounded-lg bg-background-dark/80 backdrop-blur-sm shadow-xl hover:bg-primary/20 transition-colors text-white">
              <svg
                fill="currentColor"
                height="20"
                transform="scale(-1, 1)"
                viewBox="0 0 256 256"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M229.33,98.21,53.41,33l-.16-.05A16,16,0,0,0,32.9,53.25a1,1,0,0,0,.05.16L98.21,229.33A15.77,15.77,0,0,0,113.28,240h.3a15.77,15.77,0,0,0,15-11.29l23.56-76.56,76.56-23.56a16,16,0,0,0,.62-30.38ZM224,113.3l-76.56,23.56a16,16,0,0,0-10.58,10.58L113.3,224h0l-.06-.17L48,48l175.82,65.22.16.06Z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Hospital Details Section */}
      <div className="w-2/3 flex flex-col p-6 space-y-6 overflow-y-auto">
        <div>
          <h2 className="text-3xl font-bold text-white">
            City General Hospital
          </h2>
          <p className="text-gray-400 mt-1">123 Health St, Wellness City</p>
        </div>

        {/* Wait Time Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {waitTimeCards.map((card) => (
            <div
              key={card.id}
              className="bg-gray-800/50 border border-primary/20 rounded-xl p-5 backdrop-blur-lg shadow-2xl shadow-primary/10 hover:border-primary/50 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"></div>
              <div className="relative z-10">
                <h3 className="font-bold text-lg text-white">{card.title}</h3>
                <p className="text-3xl font-bold text-primary mt-2">
                  {card.waitTime}{" "}
                  <span className="text-base font-medium text-gray-400">
                    {card.unit}
                  </span>
                </p>
                <p className="text-sm text-gray-400 mt-1">{card.description}</p>
                <div className="w-full bg-gray-700/50 rounded-full h-2.5 mt-4">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${card.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Historical Chart Section */}
        <div className="pt-6">
          <h3 className="text-xl font-bold text-white">
            Historical Wait Times
          </h3>
          <div className="mt-4 bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-16 h-16 text-gray-600 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-gray-400">Historical data visualization</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 opacity-0 animate-fade-slide-in">
          <button className="bg-primary text-background-dark font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary/30">
            Get Best Time to Visit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
