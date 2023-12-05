import ITeam from "../../../../types/team.type.ts";
import {useDriversInTeam} from "../../../../hooks/queries/driver-queries.ts";
import IDriver from "../../../../types/driver.type.ts";
import {Fragment} from "react";


export default function PostDraftLeagueTable({currentLeague, teamsInLeague, isDraftInProgress}) {

    teamsInLeague?.sort((a: ITeam, b: ITeam) => {
        return a.ranking! - b.ranking!
    });

    const driversInTeam = useDriversInTeam;

    return (
        <>
            <table className="league-table">
                <caption>
                    <h3>{currentLeague?.leagueName}</h3>
                    {/*<h3>{currentLeague?.isActive ? "League is active" : "League not active"}</h3>*/}
                </caption>
                <thead>
                <tr>
                    {/*<th className={"ranking"}>#</th>*/}
                    {/*<th className={"username"}>Username</th>*/}
                    {/*<th className={"teamname"}>Teamname</th>*/}
                    {/*<th className={"points"}>Points</th>*/}
                    {/*<th className={"drivers"} colSpan={2}>Drivers</th>*/}
                    <th>Rank</th>
                    <th className={"username"}>User Name</th>
                    <th>Team Name</th>
                    <th>Team Points</th>
                    <th>Driver 1</th>
                    <th colSpan={2}>Driver Points</th>
                    <th>Driver 2</th>
                </tr>
                </thead>
                <tbody>
                {teamsInLeague?.map((team: ITeam) => {
                    team.drivers = driversInTeam(team.id).data
                    return (
                        <tr key={team.id}>
                            <td>{team.ranking}</td>
                            <td>{team.username}</td>
                            <td>{team.teamName}</td>
                            <td>{team.teamPoints}</td>
                            {/*<td>{driversInTeam(team.id) ? driversInTeam[0]?.shortName : "d1"}</td>*/}
                            {/*<td>{driversInTeam(team.id) ? driversInTeam[1]?.shortName : "d2"}</td>*/}
                            {/*<td>{driversInTeam[0].shortName}</td>*/}
                            {/*<td>{driversInTeam[1].shortName}</td>*/}
                            {/*{team.drivers = driversInTeam(team.id)}*/}
                            {/*<td>{team.drivers[0].surname} ({team.drivers[0].points} - {team.firstPickStartingPoints})</td>*/}

                            {team.drivers?.map((driver: IDriver, i: number) => {
                                return (
                                    <Fragment key={driver.driverId}>
                                        {i == 0 && team.drivers ?
                                            <>
                                                <td>
                                                    {team.drivers[i].surname}
                                                </td>
                                                <td>
                                                    {(team.drivers[i].points! - team.firstPickStartingPoints!)}
                                                </td>
                                            </>
                                            : ""}
                                        {i == 1 && team.drivers ?
                                            <>
                                                <td>
                                                    {(team.drivers[i].points! - team.secondPickStartingPoints!)}
                                                </td>
                                                <td>
                                                    {team.drivers[i].surname}
                                                </td>
                                            </>
                                            : ""}
                                    </Fragment>
                                )
                            })}
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </>
    );
}