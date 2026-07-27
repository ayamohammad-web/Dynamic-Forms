import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/task.dart';
import '../models/form_schema.dart';
import '../data/mock_data.dart';

class TasksProvider extends ChangeNotifier {
  List<Task> _tasks = [];
  List<FormSchema> _formSchemas = MockData.formSchemas;
  bool _isLoading = true;

  List<Task> get tasks => _tasks;
  List<FormSchema> get formSchemas => _formSchemas;
  bool get isLoading => _isLoading;

  Task? getTask(String id) {
    try {
      return _tasks.firstWhere((t) => t.id == id);
    } catch (_) {
      return null;
    }
  }

  FormSchema? getFormSchema(String id) {
    try {
      return _formSchemas.firstWhere((s) => s.id == id);
    } catch (_) {
      return null;
    }
  }

  TasksProvider() {
    _loadTasks();
  }

  Future<void> _loadTasks() async {
    _isLoading = true;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      final tasksJson = prefs.getString('tasks_data');
      if (tasksJson != null) {
        final list = jsonDecode(tasksJson) as List;
        _tasks = list
            .map((j) => Task.fromJson(j as Map<String, dynamic>))
            .toList();
      } else {
        _tasks = List.from(MockData.tasks);
        await _saveTasks();
      }
      // TODO: Replace with API call:
      // GET /api/tasks → returns list of tasks assigned to the logged-in employee
      // GET /api/form-schemas → returns dynamic form schemas from server
    } catch (_) {
      _tasks = List.from(MockData.tasks);
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> _saveTasks() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
        'tasks_data', jsonEncode(_tasks.map((t) => t.toJson()).toList()));
  }

  Future<void> updateTaskStatus(String taskId, TaskStatus status) async {
    _tasks = _tasks
        .map((t) => t.id == taskId ? t.copyWith(status: status) : t)
        .toList();
    await _saveTasks();
    notifyListeners();
  }

  Future<void> refresh() async {
    await _loadTasks();
  }
}
