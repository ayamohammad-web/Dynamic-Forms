enum TaskStatus { open, inProgress, closed, pendingSync }

extension TaskStatusX on TaskStatus {
  String get label {
    switch (this) {
      case TaskStatus.open:
        return 'مفتوحة';
      case TaskStatus.inProgress:
        return 'قيد التنفيذ';
      case TaskStatus.closed:
        return 'مغلقة';
      case TaskStatus.pendingSync:
        return 'انتظار الإرسال';
    }
  }

  String get jsonValue {
    switch (this) {
      case TaskStatus.open:
        return 'open';
      case TaskStatus.inProgress:
        return 'in_progress';
      case TaskStatus.closed:
        return 'closed';
      case TaskStatus.pendingSync:
        return 'pending_sync';
    }
  }

  static TaskStatus fromJson(String s) {
    switch (s) {
      case 'in_progress':
        return TaskStatus.inProgress;
      case 'closed':
        return TaskStatus.closed;
      case 'pending_sync':
        return TaskStatus.pendingSync;
      default:
        return TaskStatus.open;
    }
  }
}

class Task {
  final String id;
  final int seq;
  final String serviceNumber;
  final String? meterNumber;
  final String taskType;
  final DateTime entryDate;
  final DateTime expectedDate;
  final TaskStatus status;
  final String customerName;
  final String phone;
  final String address;
  final String areaName;
  final String propertyType;
  final String faultType;
  final String faultCategory;
  final String faultImportance;
  final String details;
  final String formSchemaId;
  final bool isSpecial;

  const Task({
    required this.id,
    required this.seq,
    required this.serviceNumber,
    this.meterNumber,
    required this.taskType,
    required this.entryDate,
    required this.expectedDate,
    required this.status,
    required this.customerName,
    required this.phone,
    required this.address,
    required this.areaName,
    required this.propertyType,
    required this.faultType,
    required this.faultCategory,
    required this.faultImportance,
    required this.details,
    required this.formSchemaId,
    this.isSpecial = false,
  });

  Task copyWith({TaskStatus? status}) => Task(
        id: id,
        seq: seq,
        serviceNumber: serviceNumber,
        meterNumber: meterNumber,
        taskType: taskType,
        entryDate: entryDate,
        expectedDate: expectedDate,
        status: status ?? this.status,
        customerName: customerName,
        phone: phone,
        address: address,
        areaName: areaName,
        propertyType: propertyType,
        faultType: faultType,
        faultCategory: faultCategory,
        faultImportance: faultImportance,
        details: details,
        formSchemaId: formSchemaId,
        isSpecial: isSpecial,
      );

  factory Task.fromJson(Map<String, dynamic> json) => Task(
        id: json['id'] as String,
        seq: json['seq'] as int,
        serviceNumber: json['serviceNumber'] as String,
        meterNumber: json['meterNumber'] as String?,
        taskType: json['taskType'] as String,
        entryDate: DateTime.parse(json['entryDate'] as String),
        expectedDate: DateTime.parse(json['expectedDate'] as String),
        status: TaskStatusX.fromJson(json['status'] as String),
        customerName: json['customerName'] as String,
        phone: json['phone'] as String,
        address: json['address'] as String,
        areaName: json['areaName'] as String,
        propertyType: json['propertyType'] as String,
        faultType: json['faultType'] as String,
        faultCategory: json['faultCategory'] as String,
        faultImportance: json['faultImportance'] as String,
        details: json['details'] as String,
        formSchemaId: json['formSchemaId'] as String,
        isSpecial: json['isSpecial'] as bool? ?? false,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'seq': seq,
        'serviceNumber': serviceNumber,
        'meterNumber': meterNumber,
        'taskType': taskType,
        'entryDate': entryDate.toIso8601String(),
        'expectedDate': expectedDate.toIso8601String(),
        'status': status.jsonValue,
        'customerName': customerName,
        'phone': phone,
        'address': address,
        'areaName': areaName,
        'propertyType': propertyType,
        'faultType': faultType,
        'faultCategory': faultCategory,
        'faultImportance': faultImportance,
        'details': details,
        'formSchemaId': formSchemaId,
        'isSpecial': isSpecial,
      };
}
