'use client';

import React from 'react';
import { cn } from '../../utils/cn';

interface IframePlayerProps {
    embedUrl?: string;
    title?: string;
    className?: string;
}

export const IframePlayer: React.FC<IframePlayerProps> = ({
    embedUrl,
    title,
    className
}) => {
    if (!embedUrl) {
        return (
            <div className={cn(
                "relative w-full bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden",
                "aspect-video flex items-center justify-center border border-red-500/20",
                className
            )}>
                <div className="text-center text-white max-w-md mx-auto p-6">
                    <div className="bg-red-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Không có nguồn phim</h3>
                    <p className="text-gray-400 text-sm">Vui lòng thử lại sau hoặc chọn server khác</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "relative w-full bg-black rounded-lg overflow-hidden",
            "aspect-video",
            className
        )}>
            <iframe
                src={embedUrl}
                title={title || 'Video Player'}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="origin"
            />
        </div>
    );
};

interface EpisodeIframePlayerProps {
    episodes: Array<{
        server_name: string;
        server_data: Array<{
            name: string;
            slug: string;
            filename: string;
            link_embed: string;
            link_m3u8: string;
        }>;
    }>;
    movieTitle?: string;
}

export const EpisodeIframePlayer: React.FC<EpisodeIframePlayerProps> = ({
    episodes,
    movieTitle
}) => {
    const [selectedServer, setSelectedServer] = React.useState(0);
    const [selectedEpisode, setSelectedEpisode] = React.useState(0);
    const [showEpisodes, setShowEpisodes] = React.useState(true);

    if (!episodes || episodes.length === 0) {
        return (
            <div className="text-center text-white py-8">
                <p>Không có tập phim khả dụng</p>
            </div>
        );
    }

    const currentServer = episodes[selectedServer];
    const currentEpisode = currentServer?.server_data[selectedEpisode];
    const episodeTitle = currentEpisode
        ? `${movieTitle} - ${currentEpisode.name}`
        : movieTitle;

    return (
        <div className="space-y-6">
            {/* Video Player */}
            <IframePlayer
                embedUrl={currentEpisode?.link_embed}
                title={episodeTitle}
                className="w-full"
            />

            {/* Server Selection */}
            {episodes.length > 1 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Chọn Server
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {episodes.map((server, serverIndex) => (
                            <button
                                key={serverIndex}
                                onClick={() => {
                                    setSelectedServer(serverIndex);
                                    setSelectedEpisode(0);
                                }}
                                className={cn(
                                    "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                                    selectedServer === serverIndex
                                        ? "bg-red-600 text-white shadow-lg shadow-red-600/50"
                                        : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                                )}
                            >
                                {server.server_name.replace('#', '')}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Episode Selection */}
            {currentServer && currentServer.server_data.length > 1 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Danh sách tập ({currentServer.server_data.length} tập)
                        </h3>
                        <button
                            onClick={() => setShowEpisodes(!showEpisodes)}
                            className="text-white hover:text-red-400 transition-colors"
                        >
                            <svg
                                className={cn(
                                    "w-4 h-4 transition-transform",
                                    showEpisodes ? "rotate-180" : ""
                                )}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    {showEpisodes && (
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-80 overflow-y-auto p-2 bg-slate-800/30 rounded-lg">
                            {currentServer.server_data.map((episode, episodeIndex) => (
                                <button
                                    key={episodeIndex}
                                    onClick={() => setSelectedEpisode(episodeIndex)}
                                    className={cn(
                                        "px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm",
                                        selectedEpisode === episodeIndex
                                            ? "bg-red-600 text-white shadow-lg shadow-red-600/50 scale-105"
                                            : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white hover:scale-105"
                                    )}
                                >
                                    {episode.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
