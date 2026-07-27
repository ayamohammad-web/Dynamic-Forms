import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../data/mock_data.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _isLoading = true;

  User? get user => _user;
  bool get isLoggedIn => _user != null;
  bool get isLoading => _isLoading;
  List<Team> get teams => MockData.teams;

  AuthProvider() {
    _loadUser();
  }

  Future<void> _loadUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userJson = prefs.getString('auth_user');
      if (userJson != null) {
        _user = User.fromJson(jsonDecode(userJson) as Map<String, dynamic>);
      }
    } catch (_) {}
    _isLoading = false;
    notifyListeners();
  }

  Future<void> login(
      String employeeId, String password, String teamId) async {
    if (employeeId.trim().isEmpty ||
        password.trim().isEmpty ||
        teamId.isEmpty) {
      throw Exception('جميع الحقول مطلوبة');
    }

    Team? team;
    try {
      team = teams.firstWhere((t) => t.id == teamId);
    } catch (_) {
      throw Exception('الفرقة غير موجودة');
    }

    // TODO: Replace with real API call:
    // final response = await http.post(
    //   Uri.parse('$baseUrl/api/auth/login'),
    //   body: jsonEncode({'employeeId': employeeId, 'password': password, 'teamId': teamId}),
    //   headers: {'Content-Type': 'application/json'},
    // );
    // if (response.statusCode != 200) throw Exception('خطأ في تسجيل الدخول');
    // final data = jsonDecode(response.body);
    // _user = User.fromJson(data['user']);

    final mockUser = User(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      employeeId: employeeId.trim(),
      name: 'موظف اختبار',
      team: team.name,
      teamId: teamId,
    );

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_user', jsonEncode(mockUser.toJson()));
    _user = mockUser;
    notifyListeners();
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_user');
    _user = null;
    notifyListeners();
  }
}
