import DashTop from "./DashTop";
import DriverTable from "./DriverTable";
import {useEffect, useState} from "react";
import {postToggleTestLeague} from "../../services/league.service.ts";
import DraftControls from "./DraftControls";
import DraftPickTips from "./DraftPickTips";
import Layout from "../../components/Layout/Layout.tsx";
import IDriver from "../../types/driver.type.ts";
import IUser from "../../types/user.type.ts";
import {
    useAllTeamsInLeague,
    useLeagueData,
    useNextPickNumber,
    useNextUserToPick,
    useOpenLeague
} from "../../hooks/queries/league-queries.ts";
import {useCreateTeam, useCreateTestTeam, useDeleteTeam, useDeleteTestTeams} from "../../hooks/queries/team-queries.ts";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {useQueryClient} from "react-query";
import {useDriversInTeam, usePickDriver, useUndraftedDrivers} from "../../hooks/queries/driver-queries.ts";
import ITeam from "../../types/team.type.ts";
import ActiveLeagueInfo from "./ActiveLeagueInfo";
import * as Yup from "yup";
import PostDraftLeagueTable from "./LeagueTable/PostDraftLeagueTable";
import PreDraftLeagueTable from "./LeagueTable/PreDraftLeagueTable";
import {hideLoader, showLoader} from "../../services/loading.service.ts";
import Login from "../Login";


// Todo Display correct info and options in dash-top depending on users team/league status.
//  ---
//  Finish driver picking UX
//  ---
//  Check draft add test team and draft picking functions after dashboard refactor.
//  Fix draft instructions to display according to user status.
//  Finish loading spinner graphic, and pause page loading until all data is fetched.
//  Fix data missing data on page reloads.
//  Check test teams disappearing mid-draft after user logout.
//  Add toggles to show/hide certain boxes.
//  Fix layouts for consistency.
//  Change "Register" to "Sign Up", "Login" to "Sign In" and "Log Out"...

interface DashboardProps {
    userData: undefined | IUser
}

export default function Dashboard({userData}: DashboardProps) {
    const [showDraftPickTips, setShowDraftPickTips]
        = useState<boolean | undefined>(true);
    const [isPracticeLeague, setIsPracticeLeague]
        = useState<boolean | undefined | null>();
    const [isLeagueFull, setIsLeagueFull]
        = useState<boolean | undefined | null>(false);
    const [isDraftInProgress, setIsDraftInProgress]
        = useState<boolean | undefined | null>(false);
    const [currentPickNumber, setCurrentPickNumber]
        = useState<number | undefined | null>();
    const [isLeagueActive, setIsLeagueActive]
        = useState<boolean | undefined | null>();
    const [isUsersTurnToPick, setIsUsersTurnToPick]
        = useState<boolean | undefined | null>(false);
    // const [isWaitingForPick, setIsWaitingForPick]
    //     = useState<boolean | undefined | null>();
    const [leagueSize, setLeagueSize]
        = useState<number | undefined | null>(0);
    const [leagueTeams, setLeagueTeams]
        = useState<Array<ITeam> | undefined | null>([])
    const [selectedDriver, setSelectedDriver]
        = useState<IDriver | undefined | null>();
    const [lastDriverPicked, setLastDriverPicked]
        = useState<IDriver | undefined | null>();
    const [lastPickTime, setLastPickTime]
        = useState<Date | undefined | null>();

    const [loading, setLoading]
        = useState<boolean>(false);
    const [message, setMessage]
        = useState<string>("");

    const initialValues: {
        teamName: string;
    } = {
        teamName: "",
    };

    const validationSchema: Yup.ObjectSchema<object> = Yup.object().shape({
        teamName: Yup.string()
            .test(
                "length",
                "Team name must be between 3 and 20 characters",
                (val: any) =>
                    val &&
                    val.toString().length >= 3 &&
                    val.toString().length <= 20
            )
            .required("Please enter a valid team name"),
    });

    const navigate: NavigateFunction = useNavigate();

    const {
        data: openLeague,
        isLoading: loadingOpenLeague,
        error: errOpenLeague,
    } = useOpenLeague();

    const userId = userData ? userData?.id : null;
    const leagueId = userData?.team ? (userData?.team?.leagueNumber) : openLeague?.id;
    console.log("userData?.team?.league?.id")
    console.log(userData?.team?.league?.id)
    console.log("userData?.team?.leagueNumber")
    console.log(userData?.team?.leagueNumber)
    const teamsInLeague: Array<ITeam> | undefined | null = useAllTeamsInLeague(leagueId).data;


    const {
        data: leagueData,
        isLoading: loadingLeagueData,
        error: errLeagueData,
    } = useLeagueData(leagueId);

    const queryClient = useQueryClient();
    const driversInTeam = useDriversInTeam;
    const pickNumber = useNextPickNumber(leagueId).data;
    // const pickNumberRef = useRef(0);
    const nextUserToPick = useNextUserToPick(leagueId).data;
    const pickDriver = usePickDriver();
    const undraftedDrivers = useUndraftedDrivers(leagueId).data;
    const createTeam = useCreateTeam();
    const deleteTeam = useDeleteTeam(userId);
    const createTestTeam = useCreateTestTeam(leagueId);
    const deleteTestTeams = useDeleteTestTeams(leagueId);

    useEffect(() => {
        if (!userData) {
            navigate("/login");
        }
        // if (isUsersTurnToPick) {
        //     window.location.reload();
        // }
        // setIsWaitingForPick(true);
        setLeagueTeams(teamsInLeague);
        setLeagueSize(leagueTeams?.length);
        setIsPracticeLeague(leagueData?.isPracticeLeague);
        setShowDraftPickTips(!leagueData?.isPracticeLeague);
        setCurrentPickNumber(pickNumber);
        if (leagueSize
            && leagueSize >= 10) {
            setIsLeagueFull(true);
            if (!leagueData?.isActive) {
                setIsDraftInProgress(true);
                setShowDraftPickTips(false);
            }
        }
        if ((leagueData?.currentPickNumber && leagueData?.currentPickNumber > 20)
            || leagueData?.isActive) {
            setIsDraftInProgress(false);
            setIsLeagueActive(true);
        }

        setSelectedDriver(undraftedDrivers?.find((driver: IDriver) =>
            driver !== undefined));

        if (nextUserToPick?.isTestUser) {
            setIsUsersTurnToPick(true);
        }

        if (leagueData?.currentPickNumber == userData?.team?.firstPickNumber
            || leagueData?.currentPickNumber == userData?.team?.secondPickNumber) {
            setIsUsersTurnToPick(true);
        }


        // pickNumberRef.current!++;
        // console.log("currentPickNumber");
        // console.log(currentPickNumber);
        // console.log("pickNumberRef");
        // console.log(pickNumberRef.current);
        // refreshIfTurnToPick();
    }, [isUsersTurnToPick, pickNumber, currentPickNumber, leagueData?.currentPickNumber, leagueData?.isActive, leagueData?.isPracticeLeague, leagueSize, leagueTeams?.length, navigate, nextUserToPick?.isTestUser, teamsInLeague, undraftedDrivers, userData]);
    // }, [userData, leagueData, isUsersTurnToPick, leagueData?.activeTimestamp, leagueSize, teamsInLeague, leagueTeams, nextUserToPick, isLeagueFull, undraftedDrivers]);

    // const refreshIfTurnToPick = () => {
    //     if (leagueData?.currentPickNumber + 1 == userData?.team?.firstPickNumber
    //         || leagueData?.currentPickNumber + 1 == userData?.team?.secondPickNumber) {
    //         window.location.reload();
    //     }
    // }

    const handleCreateTeam = (formValue: { teamName: string }) => {
        const {teamName} = formValue;

        setMessage("");
        setLoading(true);

        createTeam.mutateAsync({userId, teamName})
            .then(() => {
                    navigate("/dashboard");
                    window.location.reload();
                },
                (error) => {
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.message) ||
                        error.message ||
                        error.toString();

                    setLoading(false);
                    setMessage(resMessage);
                }
            );
    };

    const handleDeleteUserTeam = () => {
        // postDeleteUserTeam(userData?.id)
        deleteTeam.mutateAsync()
            .then(() => {
                queryClient.invalidateQueries("leagueData")
                    .then(() => {
                        queryClient.invalidateQueries("userData")
                            .then(() => navigate("/home"))
                    });
            });
    }


    function togglePracticeOptions() {
        if (showDraftPickTips) {
            setShowDraftPickTips(false);
        } else {
            setShowDraftPickTips(true);
        }
    }

    function togglePracticeLeague() {
        if (isPracticeLeague) {
            postToggleTestLeague(leagueId)
                .then(res => {
                    setIsPracticeLeague(res);
                })
                .then(() => navigate("/dashboard"))
        } else {
            postToggleTestLeague(leagueId)
                .then(res => {
                    setIsPracticeLeague(res);
                })
                .then(() => window.location.reload())
        }
    }

    const addTestTeam = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        createTestTeam.mutateAsync()
            .then(() => {
                queryClient.invalidateQueries("allTeamsInLeague")
                    .then(() => {
                            setLeagueTeams(teamsInLeague);
                            setLeagueSize(leagueTeams?.length);
                        }
                    )
                    .then(() => {
                        if (isLeagueFull) {
                            window.location.reload();
                        }
                    })
            })
        // window.location.reload();
        console.log(leagueTeams?.length)
        if (leagueTeams && leagueTeams.length >= 9) {
            window.location.reload();
        }
    }

    const handleDeleteTestTeams = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        deleteTestTeams.mutateAsync()
            .then(() => {
                queryClient.invalidateQueries("allTeamsInLeague")
                    .then(() => {
                            setLeagueTeams(teamsInLeague);
                            setLeagueSize(leagueTeams?.length);
                            setIsPracticeLeague(false);
                        }
                    )
            })
            .then(() => window.location.reload());
        window.location.reload();
    }

    const handleDriverSelection = (driver: IDriver) => {
        setSelectedDriver(driver)
        return driver;
    }

    const handlePick = (e: { preventDefault: () => void; },
                        driver: IDriver | undefined | null) => {
        // driverId: number | string | undefined) => {
        e.preventDefault();
        pickDriver.mutateAsync({
            userId: userId,
            driverId: driver?.id,
        })
            // .then(() => {
            //     queryClient.invalidateQueries()
            .then(() => setLastDriverPicked(driver))
            .then(() => setLastPickTime(new Date()))
        // .then(() => setIsWaitingForPick(false))
        // .then(() => {
        //     if (!nextUserToPick?.isTestUser) {
        //         window.location.reload();
        //     }
        // });
        queryClient.invalidateQueries("nextPickNumber")
            .then(() => setCurrentPickNumber(pickNumber));
        // queryClient.invalidateQueries("leagueData")
        // queryClient.invalidateQueries("undraftedDrivers")
        // queryClient.invalidateQueries("driversInTeam")
        // queryClient.invalidateQueries("nextPickNumber")
        // queryClient.invalidateQueries("nextUserToPick")
        // queryClient.invalidateQueries("isUsersTurnToPick")
        // queryClient.invalidateQueries("allTeamsInLeague")
        // });
        // .then(() => {
        //     if (nextUserToPick !== userData) {
        //         window.location.reload();
        //     }
        // });
        // .then(() => setLastDriverPicked(driver))
        // .then(() => setLastPickTime(new Date()))
        // .then(() => {
        //     if (!nextUserToPick?.isTestUser) {
        //         window.location.reload();
        //     }
        // });
    }

    const isLoading = loadingOpenLeague || loadingLeagueData;
    const error = errOpenLeague || errLeagueData;

    if (isLoading) {
        return <>{() => showLoader()}</>
    } else {
        hideLoader();
    }

    if (error) {
        return (<Login userData={userData} error={error}/>);
    }

    function PreDraftDashboard() {
        return (
            <>
                <div className="col-start-3 col-span-3 h-75 box-shadow">
                    <DashTop
                        userData={userData}
                        leagueData={leagueData}
                        leagueSize={leagueSize}
                        isPracticeLeague={isPracticeLeague}
                        isLeagueFull={isLeagueFull}
                        isLeagueActive={isLeagueActive}
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        loading={loading}
                        message={message}
                        driversInTeam={driversInTeam}
                        handleCreateTeam={handleCreateTeam}
                        handleDeleteUserTeam={handleDeleteUserTeam}
                    />
                </div>
                {/*<div id="practice-draft-options" className="col-start-3 col-span-2 h-125 box-shadow">*/}
                <div className="col-start-6 col-span-5 h-75 box-shadow">
                    {showDraftPickTips ?
                        <DraftPickTips
                            isPracticeLeague={isPracticeLeague}
                            showDraftPickTips={showDraftPickTips}
                            togglePracticeOptions={togglePracticeOptions}
                        />
                        :
                        <DraftControls
                            userData={userData}
                            leagueData={leagueData}
                            isPracticeLeague={isPracticeLeague}
                            isLeagueFull={isLeagueFull}
                            showDraftPickTips={showDraftPickTips}
                            selectedDriver={selectedDriver}
                            lastPickTime={lastPickTime}
                            lastDriverPicked={lastDriverPicked}
                            isLeagueActive={isLeagueActive}
                            currentPickNumber={currentPickNumber}
                            isUsersTurnToPick={isUsersTurnToPick}
                            nextUserToPick={nextUserToPick}
                            togglePracticeOptions={togglePracticeOptions}
                            togglePracticeLeague={togglePracticeLeague}
                            addTestTeam={addTestTeam}
                            handlePick={handlePick}
                        />
                    }
                </div>
                <div className="col-start-3 col-span-3">
                    <PreDraftLeagueTable
                        leagueData={leagueData}
                        leagueSize={leagueSize}
                        leagueTeams={leagueTeams}
                        nextUserToPick={nextUserToPick}
                        isDraftInProgress={isDraftInProgress}
                    />
                </div>
                <div className="col-start-6 col-span-5">
                    <DriverTable
                        isDraftInProgress={isDraftInProgress}
                        isUsersTurnToPick={isUsersTurnToPick}
                        selectedDriver={selectedDriver}
                        undraftedDrivers={undraftedDrivers}
                        handleDriverSelection={handleDriverSelection}
                    />
                </div>
            </>
        );
    }

    function PostDraftDashboard() {
        if (!leagueData?.activeTimestamp) {
            window.location.reload();
        }
        return (
            <>
                <div className="col-start-3 col-span-3 h-125 box-shadow">
                    <DashTop
                        userData={userData}
                        leagueData={leagueData}
                        leagueSize={leagueSize}
                        isPracticeLeague={isPracticeLeague}
                        isLeagueFull={isLeagueFull}
                        isLeagueActive={isLeagueActive}
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        loading={loading}
                        message={message}
                        driversInTeam={driversInTeam}
                        handleCreateTeam={handleCreateTeam}
                        handleDeleteUserTeam={handleDeleteUserTeam}
                    />
                </div>
                {/*<div id="practice-draft-options" className="col-start-3 col-span-2 h-125 box-shadow">*/}
                <div className="col-start-6 col-span-5 125 box-shadow">
                    <PostDraftLeagueTable
                        leagueData={leagueData}
                        leagueTeams={leagueTeams}
                        driversInTeam={driversInTeam}
                    />
                    <ActiveLeagueInfo
                        isPracticeLeague={isPracticeLeague}
                        undraftedDrivers={undraftedDrivers}
                        handleDeleteTestTeams={handleDeleteTestTeams}
                    />
                </div>
                <div className="col-start-4 col-span-6">
                    <DriverTable
                        isDraftInProgress={isDraftInProgress}
                        isUsersTurnToPick={isUsersTurnToPick}
                        selectedDriver={selectedDriver}
                        undraftedDrivers={undraftedDrivers}
                        handleDriverSelection={handleDriverSelection}
                    />
                </div>
            </>
        );
    }

    return (
        <>
            <Layout>
                <div className="grid grid-cols-12 gap-2">
                    {isLeagueActive ?
                        <PostDraftDashboard/>
                        :
                        <PreDraftDashboard/>}
                </div>
            </Layout>
        </>
    )
}

//     return (
//         <>
//             <Layout>
//                 <div className="grid grid-cols-5 gap-2">
//                     <div className="col-start-2 col-span-1">
//                         <DashTop
//                             userData={userData}
//                             leagueData={leagueData}
//                             leagueSize={leagueSize}
//                             isPracticeLeague={isPracticeLeague}
//                             isLeagueFull={isLeagueFull}
//                             isLeagueActive={isLeagueActive}
//                             initialValues={initialValues}
//                             validationSchema={validationSchema}
//                             loading={loading}
//                             message={message}
//                             driversInTeam={driversInTeam}
//                             handleCreateTeam={handleCreateTeam}
//                             handleDeleteUserTeam={handleDeleteUserTeam}
//                         />
//                     </div>
//                     <div id="practice-draft-options" className="col-start-3 col-span-2">
//                         {!isLeagueActive ?
//                             <>
//                                 {showDraftPickTips ?
//                                     <DraftPickTips
//                                         isPracticeLeague={isPracticeLeague}
//                                         showDraftPickTips={showDraftPickTips}
//                                         togglePracticeOptions={togglePracticeOptions}
//                                     />
//                                     :
//                                     <>
//                                         <div className={"box-shadow"}>
//                                             <div className={"toggle-span"}>
//                                                 Draft Controls
//                                                 <PracticeOptionsToggle
//                                                     isPracticeLeague={isPracticeLeague}
//                                                     showDraftPickTips={showDraftPickTips}
//                                                     togglePracticeOptions={togglePracticeOptions}
//                                                 />
//                                             </div>
//                                         </div>
//                                         <DraftControls
//                                             userData={userData}
//                                             leagueData={leagueData}
//                                             isPracticeLeague={isPracticeLeague}
//                                             isLeagueFull={isLeagueFull}
//                                             showDraftPickTips={showDraftPickTips}
//                                             selectedDriver={selectedDriver}
//                                             lastPickTime={lastPickTime}
//                                             isLeagueActive={isLeagueActive}
//                                             currentPickNumber={currentPickNumber}
//                                             isUsersTurnToPick={isUsersTurnToPick}
//                                             nextUserToPick={nextUserToPick}
//                                             togglePracticeOptions={togglePracticeOptions}
//                                             togglePracticeLeague={togglePracticeLeague}
//                                             addTestTeam={addTestTeam}
//                                             handlePick={handlePick}
//                                         />
//                                     </>
//                                 }
//                             </>
//                             :
//                             <></>
//                         }
//                     </div>
//                     {/*<div className="col-start-2 col-span-3">*/}
//                     {/*    <DraftControls*/}
//                     {/*        currentUser={userData}*/}
//                     {/*        leagueData={leagueData}*/}
//                     {/*        isPracticeLeague={isPracticeLeague}*/}
//                     {/*        isLeagueFull={isLeagueFull}*/}
//                     {/*        showDraftPickTips={showDraftPickTips}*/}
//                     {/*        isDraftInProgress={isDraftInProgress}*/}
//                     {/*        selectedDriver={selectedDriver}*/}
//                     {/*        lastDriverPicked={lastDriverPicked}*/}
//                     {/*        lastPickTime={lastPickTime}*/}
//                     {/*        isLeagueActive={isLeagueActive}*/}
//                     {/*        currentPickNumber={currentPickNumber}*/}
//                     {/*        isUsersTurnToPick={isUsersTurnToPick}*/}
//                     {/*        nextUserToPick={nextUserToPick}*/}
//                     {/*        togglePracticeOptions={togglePracticeOptions}*/}
//                     {/*        togglePracticeLeague={togglePracticeLeague}*/}
//                     {/*        addTestTeam={addTestTeam}*/}
//                     {/*        handlePick={handlePick}*/}
//                     {/*    />*/}
//                     {/*</div>*/}
//                     {isLeagueActive ?
//                         <>
//                             <div className="col-start-2 col-span-2">
//                                 <LeagueTable
//                                     currentLeague={leagueData}
//                                     leagueSize={leagueSize}
//                                     leagueTeams={leagueTeams}
//                                     isDraftInProgress={isDraftInProgress}
//                                     nextUserToPick={nextUserToPick}
//                                     isLeagueActive={isLeagueActive}
//                                 />
//                             </div>
//                             <div className="col-start-4 col-span-1">
//                                 <ActiveLeagueInfo
//                                     isPracticeLeague={isPracticeLeague}
//                                     undraftedDrivers={undraftedDrivers}
//                                     handleDeleteTestTeams={handleDeleteTestTeams}
//                                 />
//                             </div>
//                             <div className="col-start-2 col-span-3">
//                                 <DriverTable
//                                     isDraftInProgress={isDraftInProgress}
//                                     isUsersTurnToPick={isUsersTurnToPick}
//                                     selectedDriver={selectedDriver}
//                                     undraftedDrivers={undraftedDrivers}
//                                     handleDriverSelection={handleDriverSelection}
//                                 />
//                             </div>
//                         </>
//                         :
//                         <>
//                             <div className="col-start-2 col-span-1">
//                                 <LeagueTable
//                                     currentLeague={leagueData}
//                                     leagueSize={leagueSize}
//                                     leagueTeams={leagueTeams}
//                                     isDraftInProgress={isDraftInProgress}
//                                     nextUserToPick={nextUserToPick}
//                                     isLeagueActive={isLeagueActive}
//                                 />
//
//                             </div>
//                             <div className="col-start-3 col-span-2">
//                                 <DriverTable
//                                     isDraftInProgress={isDraftInProgress}
//                                     isUsersTurnToPick={isUsersTurnToPick}
//                                     selectedDriver={selectedDriver}
//                                     undraftedDrivers={undraftedDrivers}
//                                     handleDriverSelection={handleDriverSelection}
//                                 />
//                             </div>
//                         </>
//                     }
//                 </div>
//             </Layout>
//         </>
//     );
// }


// for testing dashboard UI
{/*<div className="col-start-2 col-span-3">*/
}
{/*    <div className="grid grid-cols-5">*/
}
{/*        <div className="col-start-1 col-span-1">*/
}
{/*            <br/>1.{currentUser?.username}*/
}
{/*            <br/>2.{team?.teamName}*/
}
{/*            <br/>3.{team?.leagueId}*/
}
{/*            <br/>4.{currentLeague?.leagueName}*/
}
{/*            <br/>5.{currentLeague?.teams?.length}*/
}
{/*            <br/>6.{openLeague?.leagueName}*/
}
{/*            <br/>7.{isLeagueActive ? "LA" : "LNA"}*/
}
{/*            <br/>8.{isLeagueFull ? "LF" : "LNF"}*/
}
{/*            <br/>9.{isPracticeLeague ? "PL" : "NPL"}*/
}
{/*            <br/>10.{showPracticeOptions ? "PO" : "NP0"}*/
}
{/*            <br/>11.{isDraftInProgress ? "DIP" : "NIP"}*/
}
{/*        </div>*/
}
{/*        <div className="col-start-2 col-span-1">*/
}
{/*            <br/>12.{currentPickNumber}*/
}
{/*            <br/>13.{nextUserToPick?.username}*/
}
{/*            <br/>14.{isUsersTurnToPick ? "pick" : "no pick"}*/
}
{/*            <br/>15.{selectedDriver?.surname}*/
}
{/*            <br/>16.{lastDriverPicked?.surname}*/
}
{/*            <br/>17.{lastPickTime?.getTime()}*/
}
{/*        </div>*/
}
{/*        <div className="col-start-3 col-span-1">*/
}
{/*            <br/>18.{leagueTeams?.map((team: ITeam) => {*/
}
{/*            return <div key={team.id}>{team.teamName}</div>*/
}
{/*        })}*/
}
{/*        </div>*/
}
{/*        <div className="col-start-4 col-span-1">*/
}
{/*            19.{driversInTeam?.map((driver: IDriver) => {*/
}
{/*            return <div key={driver.driverId}>{driver.surname}</div>*/
}
{/*        })}*/
}
{/*        </div>*/
}
{/*        <div className="col-start-5 col-span-1">*/
}
{/*            20.{undraftedDrivers?.map((driver: IDriver) => {*/
}
{/*            return <div key={driver.driverId}>{driver.surname}</div>*/
}
{/*        })}*/
}
{/*        </div>*/
}
{/*    </div>*/
}
{/*</div>*/
}