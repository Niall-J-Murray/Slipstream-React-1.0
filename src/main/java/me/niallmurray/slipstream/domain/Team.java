package me.niallmurray.slipstream.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "team",
        uniqueConstraints =
        @UniqueConstraint(columnNames = {"league_league_id", "firstPickNumber"}))
public class Team {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @JoinColumn(name = "user_id")
  @JsonIgnore
  @OneToOne(cascade = {CascadeType.MERGE, CascadeType.PERSIST})
  //1-1 for now, see comment in User.class
  private User user;
  @Column()
  private String username;
  @Column()
  private String teamName;
  @Column()
  private Boolean isTestTeam;
  @Column()
  private Integer firstPickNumber;
  @Column()
  private Integer secondPickNumber;
  @Column()
  private Double startingPoints;
  @Column()
  private Double teamPoints;
  @Column()
  private Integer ranking;
  @ManyToOne()
  @JsonIgnore
  League league;
  @JsonIgnore
  @Column()
  @ManyToMany(fetch = FetchType.LAZY,
          cascade = {CascadeType.MERGE, CascadeType.PERSIST, CascadeType.DETACH},
          mappedBy = "teams")
  private List<Driver> drivers = new ArrayList<>(6);

  @Override
  public String toString() {
    return "Team:" +
            " teamId= " + id +
//            ", user= " + user.getUsername() +
            ", username= " + username +
            ", teamName=' " + teamName + '\'' +
            ", firstPick= " + firstPickNumber +
            ", secondPick= " + secondPickNumber;

  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Team team)) return false;
    return Objects.equals(id, team.id) && Objects.equals(teamName, team.teamName);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, teamName);
  }
}