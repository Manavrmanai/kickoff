// import React, { useMemo } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Activity, Target, Users, Goal, Repeat, ShieldAlert, Zap } from 'lucide-react';
// import type { Fixture, FixtureEvent, FixturePlayerStats, FixtureStats } from '@/types/api';

// interface MatchInsightsProps {
//   fixture: Fixture;
//   stats?: FixtureStats[] | undefined;
//   events?: FixtureEvent[] | undefined;
//   playerStats?: FixturePlayerStats[] | undefined;
//   isLoadingStats?: boolean;
//   isLoadingEvents?: boolean;
//   isLoadingPlayers?: boolean;
// }

// const parseNumber = (value: unknown): number => {
//   if (value == null) return 0;
//   if (typeof value === 'number') return value;
//   const s = String(value).replace('%', '').trim();
//   const n = parseFloat(s);
//   return Number.isNaN(n) ? 0 : n;
// };

// const normalizeKey = (k: string) => k.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

// const toStatRecord = (s: FixtureStats['statistics']): Record<string, number | string | null> => {
//   if (Array.isArray(s)) {
//     const rec: Record<string, number | string | null> = {};
//     for (const item of s) {
//       const key = normalizeKey(String((item as any).type ?? ''));
//       rec[key] = (item as any).value as any;
//     }
//     return rec;
//   }
//   const out: Record<string, number | string | null> = {};
//   for (const [k, v] of Object.entries(s || {})) {
//     out[normalizeKey(k)] = v as any;
//   }
//   return out;
// };

// const metricLabel: Record<string, string> = {
//   shots_on_goal: 'Shots on Target',
//   total_shots: 'Total Shots',
//   ball_possession: 'Possession %',
//   passes_accuracy: 'Pass Accuracy %',
//   corner_kicks: 'Corners',
//   offsides: 'Offsides',
//   fouls: 'Fouls',
//   yellow_cards: 'Yellow Cards',
//   red_cards: 'Red Cards',
//   goalkeeper_saves: 'GK Saves',
// };

// const statKeysOrder: Array<keyof typeof metricLabel> = [
//   'ball_possession',
//   'shots_on_goal',
//   'total_shots',
//   'passes_accuracy',
//   'corner_kicks',
//   'fouls',
//   'offsides',
//   'yellow_cards',
//   'red_cards',
//   'goalkeeper_saves',
// ];

// const ProgressBar = ({ leftValue, rightValue, isPercent = false }: { leftValue: number; rightValue: number; isPercent?: boolean }) => {
//   const total = Math.max(1, leftValue + rightValue);
//   const leftPercent = isPercent ? leftValue : (leftValue / total) * 100;
//   const pct = Math.max(0, Math.min(100, Math.round(leftPercent)));

//   const widthClass = (() => {
//     if (pct <= 0) return 'w-0';
//     if (pct <= 5) return 'w-[5%]';
//     if (pct <= 10) return 'w-[10%]';
//     if (pct <= 15) return 'w-[15%]';
//     if (pct <= 20) return 'w-1/5';
//     if (pct <= 25) return 'w-1/4';
//     if (pct <= 30) return 'w-[30%]';
//     if (pct <= 33) return 'w-1/3';
//     if (pct <= 40) return 'w-2/5';
//     if (pct <= 50) return 'w-1/2';
//     if (pct <= 60) return 'w-3/5';
//     if (pct <= 66) return 'w-2/3';
//     if (pct <= 70) return 'w-[70%]';
//     if (pct <= 75) return 'w-3/4';
//     if (pct <= 80) return 'w-4/5';
//     if (pct <= 90) return 'w-[90%]';
//     return 'w-full';
//   })();

//   return (
//     <div className="flex items-center gap-2 w-full">
//       <span className="w-10 text-right text-xs font-semibold">
//         {isPercent ? `${leftValue}%` : leftValue}
//       </span>
//       <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
//         <div className={`h-full bg-primary transition-all duration-300 ${widthClass}`} />
//       </div>
//       <span className="w-10 text-xs font-semibold">
//         {isPercent ? `${rightValue}%` : rightValue}
//       </span>
//     </div>
//   );
// };

// export default function MatchInsights({
//   fixture,
//   stats,
//   events,
//   playerStats,
//   isLoadingStats,
//   isLoadingEvents,
//   isLoadingPlayers,
// }: MatchInsightsProps) {
//   const statsBySide = useMemo(() => {
//     if (!stats || stats.length === 0) return null;
//     const homeId = fixture?.teams?.home?.id;
//     const awayId = fixture?.teams?.away?.id;
//     const home = stats.find((s) => s.team?.id === homeId);
//     const away = stats.find((s) => s.team?.id === awayId);
//     return home && away ? { home, away } : null;
//   }, [stats, fixture]);

//   const normalizedStats = useMemo(() => {
//     if (!statsBySide) return null as null | { home: Record<string, number | string | null>; away: Record<string, number | string | null> };
//     return {
//       home: toStatRecord(statsBySide.home.statistics),
//       away: toStatRecord(statsBySide.away.statistics),
//     };
//   }, [statsBySide]);

//   const topPlayers = useMemo(() => {
//     if (!playerStats || playerStats.length === 0) return [] as Array<{ id: number; name: string; rating: number; teamId?: number; teamName?: string }>;
//     const players: Array<{ id: number; name: string; rating: number; teamId?: number; teamName?: string }> = [];

//     for (const team of playerStats) {
//       for (const p of team.players || []) {
//         const ratingRaw = p.statistics?.[0]?.rating as unknown;
//         const rating = ratingRaw == null ? 0 : parseFloat(String(ratingRaw));
//         if (!Number.isNaN(rating) && rating > 0) {
//           players.push({
//             id: p.player.id,
//             name: p.player.name,
//             rating,
//             teamId: team.team?.id,
//             teamName: team.team?.name,
//           });
//         }
//       }
//     }
//     return players.sort((a, b) => b.rating - a.rating).slice(0, 5);
//   }, [playerStats]);

//   const getEventIcon = (type?: string, detail?: string) => {
//     if (type === 'Goal') return <Goal className="h-4 w-4 text-green-500" />;
//     if (type === 'Card' && detail?.includes('Yellow')) return <Users className="h-4 w-4 text-yellow-500" />;
//     if (type === 'Card' && detail?.includes('Red')) return <Users className="h-4 w-4 text-red-500" />;
//     if (type === 'subst' || type === 'Substitution') return <Repeat className="h-4 w-4 text-blue-500" />;
//     if (type?.toLowerCase() === 'var') return <ShieldAlert className="h-4 w-4 text-purple-500" />;
//     return <Zap className="h-4 w-4 text-muted-foreground" />;
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//       <Card className="lg:col-span-2">
//         <CardHeader className="pb-3">
//           <CardTitle className="flex items-center gap-2 text-base">
//             <Target className="h-4 w-4 text-primary" />
//             Match Statistics
//             {isLoadingStats && <Badge variant="secondary" className="ml-2">Loading</Badge>}
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           {!statsBySide && !isLoadingStats && (
//             <div className="text-sm text-muted-foreground">Statistics are not available for this match.</div>
//           )}
//           {statsBySide && normalizedStats && (
//             <div className="space-y-4">
//               {statKeysOrder.map((key) => {
//                 const isPercent = key.includes('percent') || key.includes('possession') || key.includes('accuracy');
//                 const left = parseNumber(normalizedStats.home[key]);
//                 const right = parseNumber(normalizedStats.away[key]);
//                 const label = metricLabel[key] || key.replace(/_/g, ' ');

//                 return (
//                   <div key={key} className="space-y-2">
//                     <div className="text-xs font-medium text-center">{label}</div>
//                     <div className="grid grid-cols-5 items-center gap-2">
//                       <div className="col-span-1 text-right text-xs text-muted-foreground truncate">
//                         {fixture?.teams?.home?.name}
//                       </div>
//                       <div className="col-span-3">
//                         <ProgressBar leftValue={left} rightValue={right} isPercent={isPercent} />
//                       </div>
//                       <div className="col-span-1 text-xs text-muted-foreground truncate">
//                         {fixture?.teams?.away?.name}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader className="pb-3">
//           <CardTitle className="flex items-center gap-2 text-base">
//             <Users className="h-4 w-4 text-green-500" />
//             Top Performers
//             {isLoadingPlayers && <Badge variant="secondary" className="ml-2">Loading</Badge>}
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           {topPlayers.length === 0 && !isLoadingPlayers && (
//             <div className="text-sm text-muted-foreground">No player ratings available.</div>
//           )}
//           {topPlayers.map((player, index) => (
//             <div key={player.id} className="flex items-center justify-between border rounded-md p-2">
//               <div className="flex items-center gap-2">
//                 <div
//                   className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
//                     index === 0 ? 'bg-yellow-500 text-black' :
//                     index === 1 ? 'bg-gray-300 text-black' :
//                     index === 2 ? 'bg-amber-600 text-white' :
//                     'bg-muted text-muted-foreground'
//                   }`}
//                 >
//                   {index + 1}
//                 </div>
//                 <div>
//                   <div className="text-sm font-medium">{player.name}</div>
//                   <div className="text-xs text-muted-foreground">{player.teamName}</div>
//                 </div>
//               </div>
//               <Badge variant="outline">{player.rating.toFixed(1)}</Badge>
//             </div>
//           ))}
//         </CardContent>
//       </Card>

//       <Card className="lg:col-span-3">
//         <CardHeader className="pb-3">
//           <CardTitle className="flex items-center gap-2 text-base">
//             <Activity className="h-4 w-4 text-yellow-500" />
//             Key Events
//             {isLoadingEvents && <Badge variant="secondary" className="ml-2">Loading</Badge>}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {(!events || events.length === 0) && !isLoadingEvents ? (
//             <div className="text-sm text-muted-foreground">No events available for this match.</div>
//           ) : (
//             <div className="space-y-3">
//               {(events || [])
//                 .sort((a, b) => (a.time?.elapsed || 0) - (b.time?.elapsed || 0))
//                 .map((event, index) => (
//                   <div key={index} className="flex items-center gap-3 text-sm">
//                     <div className="w-12 text-right text-muted-foreground">{event.time?.elapsed}'</div>
//                     <div className="w-4 flex items-center justify-center">{getEventIcon(event.type, event.detail)}</div>
//                     <div className="flex-1">
//                       <div className="font-medium">
//                         {event.type} {event.detail ? `• ${event.detail}` : ''}
//                       </div>
//                       <div className="text-xs text-muted-foreground">
//                         {event.team?.name} {event.player?.name ? `— ${event.player.name}` : ''}
//                         {event.assist?.name && ` (Assist: ${event.assist.name})`}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
