import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../models/user.dart';
import '../theme/app_theme.dart';
import 'dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _employeeIdCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _showPassword = false;
  bool _loading = false;
  Team? _selectedTeam;
  bool _showTeamDropdown = false;

  @override
  void dispose() {
    _employeeIdCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (_loading) return;
    setState(() => _loading = true);
    try {
      await context.read<AuthProvider>().login(
            _employeeIdCtrl.text,
            _passwordCtrl.text,
            _selectedTeam?.id ?? '',
          );
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const DashboardScreen()),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceAll('Exception: ', '')),
          backgroundColor: AppColors.danger,
        ),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF1565C0), Color(0xFF1E40AF), Color(0xFF0D47A1)],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              children: [
                // Title
                const Text(
                  'برنامج الفرق الفنية',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                  textDirection: TextDirection.rtl,
                ),
                const SizedBox(height: 28),

                // Logo
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withOpacity(0.15),
                    border: Border.all(
                      color: AppColors.accent.withOpacity(0.5),
                      width: 2,
                    ),
                  ),
                  child: const Icon(
                    Icons.flash_on,
                    size: 64,
                    color: AppColors.accent,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'فرق الطوارئ',
                  style: TextStyle(
                    color: AppColors.accent,
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1,
                  ),
                  textDirection: TextDirection.rtl,
                ),
                const SizedBox(height: 32),

                // Form card
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      // Employee ID
                      Directionality(
                        textDirection: TextDirection.rtl,
                        child: TextField(
                          controller: _employeeIdCtrl,
                          keyboardType: TextInputType.number,
                          textAlign: TextAlign.right,
                          decoration: const InputDecoration(
                            hintText: 'الرقم الوظيفي',
                            prefixIcon: Icon(Icons.person_outline,
                                color: AppColors.primary),
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Password
                      Directionality(
                        textDirection: TextDirection.rtl,
                        child: TextField(
                          controller: _passwordCtrl,
                          obscureText: !_showPassword,
                          textAlign: TextAlign.right,
                          decoration: InputDecoration(
                            hintText: 'كلمة المرور',
                            prefixIcon: const Icon(Icons.lock_outline,
                                color: AppColors.primary),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _showPassword
                                    ? Icons.visibility_off
                                    : Icons.visibility,
                                color: AppColors.textMuted,
                                size: 18,
                              ),
                              onPressed: () =>
                                  setState(() => _showPassword = !_showPassword),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Team picker
                      GestureDetector(
                        onTap: () => setState(
                            () => _showTeamDropdown = !_showTeamDropdown),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.keyboard_arrow_down,
                                  color: AppColors.textMuted, size: 18),
                              Expanded(
                                child: Text(
                                  _selectedTeam?.name ?? 'اختر المجموعة',
                                  textAlign: TextAlign.right,
                                  style: TextStyle(
                                    color: _selectedTeam != null
                                        ? AppColors.text
                                        : AppColors.textMuted,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.refresh,
                                    color: AppColors.primary, size: 20),
                                onPressed: () =>
                                    setState(() => _selectedTeam = null),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Team options
                      if (_showTeamDropdown) ...[
                        const SizedBox(height: 4),
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Column(
                            children: auth.teams
                                .map((team) => ListTile(
                                      title: Text(
                                        team.name,
                                        textAlign: TextAlign.right,
                                        textDirection: TextDirection.rtl,
                                        style: TextStyle(
                                          color: _selectedTeam?.id == team.id
                                              ? AppColors.primary
                                              : AppColors.text,
                                          fontWeight:
                                              _selectedTeam?.id == team.id
                                                  ? FontWeight.w600
                                                  : FontWeight.normal,
                                          fontSize: 14,
                                        ),
                                      ),
                                      dense: true,
                                      onTap: () => setState(() {
                                        _selectedTeam = team;
                                        _showTeamDropdown = false;
                                      }),
                                    ))
                                .toList(),
                          ),
                        ),
                      ],
                      const SizedBox(height: 20),

                      // Buttons
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () {
                                _employeeIdCtrl.clear();
                                _passwordCtrl.clear();
                                setState(() => _selectedTeam = null);
                              },
                              style: OutlinedButton.styleFrom(
                                minimumSize: const Size(0, 50),
                              ),
                              child: const Text('خروج'),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: _loading ? null : _login,
                              style: ElevatedButton.styleFrom(
                                minimumSize: const Size(0, 50),
                              ),
                              child: _loading
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                          color: Colors.white, strokeWidth: 2),
                                    )
                                  : const Text('دخول'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Device ID
                const Text(
                  'IMEI: 00000000000000',
                  style: TextStyle(
                    color: Colors.white54,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
