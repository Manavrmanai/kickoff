import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLeague, useLeagueStandings, useFixtures } from '@/hooks/useFootballApi';
import { DEFAULT_SEASON } from '@/lib/constants';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const LeagueDetail: React.FC = () => {
	const params = useParams();
	const leagueId = Number(params.id);

	const { data: league } = useLeague(leagueId);
	const { data: standings = [] } = useLeagueStandings(leagueId, DEFAULT_SEASON);
	const { data: fixtures = [] } = useFixtures(leagueId, DEFAULT_SEASON);

	if (!leagueId) {
		return (
			<div className="p-6">
				<Card>
					<CardContent className="p-6">Invalid league id.</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center gap-4">
				{league?.logo && <img src={league.logo} alt={league?.name} className="w-12 h-12" />}
				<div>
					<h1 className="text-2xl font-bold">{league?.name || `League ${leagueId}`}</h1>
					<p className="text-sm text-muted-foreground">Season {DEFAULT_SEASON}</p>
				</div>
				<div className="ml-auto">
					<Link to="/leagues">
						<Button variant="outline">Back to Leagues</Button>
					</Link>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Recent Fixtures</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{fixtures.slice(0, 8).map((f: any) => (
							<div key={f.id} className="flex items-center justify-between border-b last:border-b-0 py-2">
								<div className="flex items-center gap-2 w-1/2">
									{f.teams?.home?.logo && <img src={f.teams.home.logo} alt={`${f.teams?.home?.name} logo`} className="w-5 h-5" />}
									<span className="truncate">{f.teams?.home?.name}</span>
								</div>
								<div className="text-sm font-semibold w-24 text-center">
									{typeof f.goals?.home === 'number' && typeof f.goals?.away === 'number'
										? `${f.goals.home} - ${f.goals.away}`
										: new Date(f.date).toLocaleDateString()}
								</div>
								<div className="flex items-center gap-2 w-1/2 justify-end">
									<span className="truncate">{f.teams?.away?.name}</span>
									{f.teams?.away?.logo && <img src={f.teams.away.logo} alt={`${f.teams?.away?.name} logo`} className="w-5 h-5" />}
								</div>
							</div>
						))}
						{fixtures.length === 0 && <div className="text-sm text-muted-foreground">No fixtures found.</div>}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Standings</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-12 text-xs font-medium text-muted-foreground mb-2">
							<div className="col-span-1">#</div>
							<div className="col-span-7">Team</div>
							<div className="col-span-2 text-right">P</div>
							<div className="col-span-2 text-right">Pts</div>
						</div>
						{standings.slice(0, 20).map((s: any) => (
							<div key={s.team?.id} className="grid grid-cols-12 items-center py-1 border-b last:border-b-0">
								<div className="col-span-1">{s.rank}</div>
								<div className="col-span-7 flex items-center gap-2">
									{s.team?.logo && <img src={s.team.logo} alt={`${s.team?.name} logo`} className="w-5 h-5" />}
									<span className="truncate">{s.team?.name}</span>
								</div>
								<div className="col-span-2 text-right">{s.all?.played ?? 0}</div>
								<div className="col-span-2 text-right font-semibold">{s.points ?? 0}</div>
							</div>
						))}
						{standings.length === 0 && <div className="text-sm text-muted-foreground">No standings found.</div>}
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default LeagueDetail;

