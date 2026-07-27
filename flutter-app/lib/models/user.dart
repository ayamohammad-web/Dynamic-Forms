class User {
  final String id;
  final String employeeId;
  final String name;
  final String team;
  final String teamId;

  const User({
    required this.id,
    required this.employeeId,
    required this.name,
    required this.team,
    required this.teamId,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] as String,
        employeeId: json['employeeId'] as String,
        name: json['name'] as String,
        team: json['team'] as String,
        teamId: json['teamId'] as String,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'employeeId': employeeId,
        'name': name,
        'team': team,
        'teamId': teamId,
      };
}

class Team {
  final String id;
  final String name;

  const Team({required this.id, required this.name});
}
