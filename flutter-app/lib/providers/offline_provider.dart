import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class OfflineQueueItem {
  final String id;
  final String type; // 'form_submit' | 'task_close'
  final Map<String, dynamic> data;
  final DateTime createdAt;
  final int retries;

  OfflineQueueItem({
    required this.id,
    required this.type,
    required this.data,
    required this.createdAt,
    required this.retries,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'data': data,
        'createdAt': createdAt.toIso8601String(),
        'retries': retries,
      };

  factory OfflineQueueItem.fromJson(Map<String, dynamic> json) =>
      OfflineQueueItem(
        id: json['id'] as String,
        type: json['type'] as String,
        data: json['data'] as Map<String, dynamic>,
        createdAt: DateTime.parse(json['createdAt'] as String),
        retries: json['retries'] as int,
      );
}

class OfflineProvider extends ChangeNotifier {
  List<OfflineQueueItem> _queue = [];
  bool _isOnline = true; // TODO: Wire with connectivity_plus package

  List<OfflineQueueItem> get queue => _queue;
  bool get isOnline => _isOnline;
  int get pendingCount => _queue.length;

  OfflineProvider() {
    _loadQueue();
  }

  Future<void> _loadQueue() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final data = prefs.getString('offline_queue');
      if (data != null) {
        final list = jsonDecode(data) as List;
        _queue = list
            .map((j) =>
                OfflineQueueItem.fromJson(j as Map<String, dynamic>))
            .toList();
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> addToQueue(
      String type, Map<String, dynamic> data) async {
    final item = OfflineQueueItem(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      type: type,
      data: data,
      createdAt: DateTime.now(),
      retries: 0,
    );
    _queue.add(item);
    await _saveQueue();
    notifyListeners();
  }

  Future<void> _saveQueue() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
        'offline_queue',
        jsonEncode(_queue.map((i) => i.toJson()).toList()));
  }

  Future<void> clearAll() async {
    _queue.clear();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('offline_queue');
    notifyListeners();
  }

  // TODO: Call this when connectivity changes
  void setOnlineStatus(bool online) {
    _isOnline = online;
    notifyListeners();
    if (online && _queue.isNotEmpty) {
      _syncQueue();
    }
  }

  Future<void> _syncQueue() async {
    // TODO: Implement sync logic - iterate queue and POST each item to the API
    // On success, remove from queue. On failure, increment retries.
  }
}
