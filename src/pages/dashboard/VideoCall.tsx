import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Users, Share2, LayoutGrid } from 'lucide-react';
import Button from '../../components/ui/Button';

const VideoCall: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  return (
    <div className="h-[calc(100vh-6rem)] bg-gray-900 text-white p-4">
      <div className="h-full flex flex-col">
        {/* Main video grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Counselor video */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            <img 
              src="https://images.pexels.com/photos/5324917/pexels-photo-5324917.jpeg" 
              alt="Counselor"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-50 px-3 py-1 rounded-full">
              <span className="text-sm">Dr. Sarah (You)</span>
            </div>
          </div>
          
          {/* Student video */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            <img 
              src="https://images.pexels.com/photos/3771118/pexels-photo-3771118.jpeg" 
              alt="Student"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-50 px-3 py-1 rounded-full">
              <span className="text-sm">John (Student)</span>
            </div>
          </div>
        </div>
        
        {/* Controls bar */}
        <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-700'}`}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>
            
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 rounded-full ${!isVideoOn ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-700'}`}
            >
              {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-3 rounded-full bg-gray-600 hover:bg-gray-700">
              <MessageSquare className="h-6 w-6" />
            </button>
            
            <button className="p-3 rounded-full bg-gray-600 hover:bg-gray-700">
              <Users className="h-6 w-6" />
            </button>
            
            <button className="p-3 rounded-full bg-gray-600 hover:bg-gray-700">
              <Share2 className="h-6 w-6" />
            </button>
            
            <button 
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-3 rounded-full bg-gray-600 hover:bg-gray-700"
            >
              <LayoutGrid className="h-6 w-6" />
            </button>
          </div>
          
          <Button variant="danger" size="lg" className="px-8">
            <PhoneOff className="h-5 w-5 mr-2" />
            End Call
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;