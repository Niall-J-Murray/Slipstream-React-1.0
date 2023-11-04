package me.niallmurray.slipstream.webrest;

import jakarta.validation.Valid;
import me.niallmurray.slipstream.domain.Driver;
import me.niallmurray.slipstream.domain.League;
import me.niallmurray.slipstream.domain.Team;
import me.niallmurray.slipstream.service.DriverService;
import me.niallmurray.slipstream.service.TeamService;
import me.niallmurray.slipstream.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;


@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/driver")
public class DriverController {
  @Autowired
  DriverService driverService;
  @Autowired
  UserService userService;
  @Autowired
  TeamService teamService;

  @GetMapping("/{driverId}")
  @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
  public ResponseEntity<Driver> getDriverData(@PathVariable Long driverId) {
    Driver driver = driverService.findById(driverId);
//    System.out.println("driver entity: " + ResponseEntity.ok(driverOpt.orElse(null)));
    return ResponseEntity.ok(driver);
  }

  @GetMapping("/allDrivers")
  @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
  public ResponseEntity<List<Driver>> getAllDrivers() {
    List<Driver> allDrivers = driverService.sortDriversStanding();
//    System.out.println("getAllDrivers: " + allDrivers);
    return ResponseEntity.ok(allDrivers);
  }

  @GetMapping("/{teamId}")
  @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
  public ResponseEntity<List<Driver>> getDriversInTeam(@PathVariable Long teamId) {
    Team team = teamService.findById(teamId);
    List<Driver> driversInTeam = new ArrayList<>(2);
    Long driverId1 = team.getDrivers().get(0).getDriverId();
    Long driverId2 = team.getDrivers().get(1).getDriverId();
    Driver driver1 = driverService.findById(driverId1);
    Driver driver2 = driverService.findById(driverId2);
    driversInTeam.add(driver1);
    driversInTeam.add(driver2);
//    System.out.println("driver entity: " + ResponseEntity.ok(driverOpt.orElse(null)));
    return ResponseEntity.ok(driversInTeam);
  }

  @GetMapping("/undraftedDrivers/{leagueId}")
  @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
  public ResponseEntity<List<Driver>> getUndraftedDrivers(@PathVariable Long leagueId) {
    List<Driver> undraftedDrivers = driverService.getUndraftedDrivers(leagueId);
//    System.out.println("getAllDrivers: " + allDrivers);
    return ResponseEntity.ok(undraftedDrivers);
  }

  @PostMapping("/pick/{userId}")
  public ResponseEntity<Driver> postPickDriver(@PathVariable Long userId, @Valid @RequestParam("driverId") Long driverId) {
    System.out.println("driverID: " + driverId);
//    Long driverIdFromJson = Long.valueOf(driverId.substring(13, (driverId.length() - 2)));
    Long driverIdFromJson = driverId;
    League userLeague = userService.findById(userId).getTeam().getLeague();
    if (Boolean.TRUE.equals(teamService.isTestPick(userLeague))) {
      teamService.addDriverToTestTeam(userId, driverIdFromJson);
    } else {
      teamService.addDriverToTeam(userId, driverIdFromJson);
    }
    Driver driver = driverService.findById(driverIdFromJson);
    //Async send email to next to pick
//    emailService.asyncPickNotificationEmail(userLeague);
    return ResponseEntity.ok(driver);
  }
}
