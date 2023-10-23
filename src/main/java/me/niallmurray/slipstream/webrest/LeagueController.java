package me.niallmurray.slipstream.webrest;

import me.niallmurray.slipstream.domain.League;
import me.niallmurray.slipstream.domain.Team;
import me.niallmurray.slipstream.service.LeagueService;
import me.niallmurray.slipstream.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/league")
public class LeagueController {
  @Autowired
  LeagueService leagueService;
  @Autowired
  TeamService teamService;

  @GetMapping("/{leagueId}")
  @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
  public ResponseEntity<League> getLeagueData(@PathVariable Long leagueId) {
    League league = leagueService.findById(leagueId);
//    System.out.println("league entity: " + ResponseEntity.ok(leagueOpt.orElse(null)));
    return ResponseEntity.ok(league);
  }

  @GetMapping("/openLeague")
  @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
  public ResponseEntity<League> getOpenLeague() {
    League availableLeague = leagueService.findAvailableLeague();
    if (!availableLeague.getTeams().isEmpty()
            && availableLeague.getTeams().size() % 10 == 0) {
      availableLeague = leagueService.createLeague();
    }
//    System.out.println("league entity: " + ResponseEntity.ok(leagueOpt.orElse(null)));
    return ResponseEntity.ok(availableLeague);
  }

  @GetMapping("/{leagueId}/allTeams")
  @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
  public ResponseEntity<List<Team>> getAllLeagueTeams(@PathVariable Long leagueId) {
    League league = leagueService.findById(leagueId);
    List<Team> teams = teamService.findAllTeamsByLeague(league);
//    System.out.println("league: " + league);
    System.out.println("league teams list: " + teams);
    return ResponseEntity.ok(teams);
  }

  @GetMapping("/team/{teamId}")
  @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
  public ResponseEntity<League> getTeamLeague(@PathVariable Long teamId) {
    Team team = teamService.findById(teamId);
    Long leagueId = team.getLeague().getLeagueId();
    League league = leagueService.findById(leagueId);
//    System.out.println("league entity: " + ResponseEntity.ok(leagueOpt.orElse(null)));
    return ResponseEntity.ok(league);
  }

  @GetMapping("/{leagueId}/isDraftInProgress")
  @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
  public ResponseEntity<Boolean> getIsDraftInProgress(@PathVariable Long leagueId) {
    boolean isDraftInProgress = false;
    League league = leagueService.findById(leagueId);
    if (league.getTeams().size() >= 10) {
      isDraftInProgress = true;
    }
    return ResponseEntity.ok(isDraftInProgress);
  }

  @GetMapping("/{leagueId}/isLeagueActive")
  @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
  public ResponseEntity<Boolean> getIsLeagueActive(@PathVariable Long leagueId) {
    League league = leagueService.findById(leagueId);
    return ResponseEntity.ok(league.getIsActive());
  }

}