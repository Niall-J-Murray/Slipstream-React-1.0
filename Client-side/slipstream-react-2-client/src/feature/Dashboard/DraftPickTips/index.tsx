import {HashLink} from 'react-router-hash-link';
import PracticeOptionsToggle from "../DraftControls/PracticeDraftOptions/PracticeOptionsToggle";

interface RemindersProps {
    isPracticeLeague: boolean | undefined | null,
    showDraftPickTips: boolean | undefined,
    togglePracticeOptions: () => void,
}

export default function DraftPickTips({
                                          isPracticeLeague,
                                          showDraftPickTips,
                                          togglePracticeOptions,
                                      }: RemindersProps) {
    return (
        <>
            <div className="box-shadow">
                <div className={"toggle-span"}>
                    Draft Pick Tips
                    <PracticeOptionsToggle
                        isPracticeLeague={isPracticeLeague}
                        showDraftPickTips={showDraftPickTips}
                        togglePracticeOptions={togglePracticeOptions}
                    />
                </div>
                <ul className="text-block">
                    <li>When you create a team, it is automatically added to the open league shown below.</li>
                    <li>If you want to delete your team, you must wait until the league you joined is active.</li>
                    <li>Once a league has 10 teams the draft picks will start, and players take turns
                        picking two drivers from the available undrafted drivers.
                    </li>
                    <li>When all 20 drivers are picked, the league is active and locked. No changes can then be
                        made, apart from deleting your team or any test teams added.
                    </li>
                    <li>All teams start on 0 points and only score points from F1 races after their league is active.
                    </li>
                    <li>Any current points your driver has will not be added to your team points.</li>
                    <li>If a driver is replaced or substituted, you will receive the points of their replacement.</li>
                    <li>Tie breaks will be won by whoever picked last with their first pick.</li>
                    <li>See the <HashLink smooth to="/home" elementId="how-to-play">homepage</HashLink> for full
                        details, or
                        view a demo
                        draft video <a
                            href="https://vimeo.com/842933066" target="_blank">here</a>.
                    </li>
                </ul>
            </div>
        </>
    );
}
