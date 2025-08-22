# UniGrading - Blockchain Grading System

## 🎯 Targets
University grading system on Solana blockchain
- Teachers assign grades → Stored on blockchain (immutable)
- Students view grades → Transparent & verifiable
- Admins only manage system → (not so called) Decentralized control 

## 🏗️ Current Status
✅ Smart Contract (Rust/Anchor) - 40% done
✅ Frontend UI (Next.js/React) - 30% done (cần sửa lại)
❌ integrate Smartcontract/Frontend - 10% done 

## 🚀 Missing
1. Connect frontend to blockchain
2. Real user management
3. Advanced grading features
4. Reporting system

## Còn thiếu

### **1. Core Features chưa có**

- ❌ Quản lý lớp học (tạo, sửa, xóa)
- ❌ Enrollment system (ghi danh học sinh vào lớp)
- ❌ Bulk grade import/export
- ❌ Grade categories (Quiz, Midterm, Final, etc.)
- ❌ Weighted grading system
- ❌ Grade history và audit trail
- ❌ Student profile management
- ❌ Academic calendar integration

### **2. Administrative Features**

- ❌ User management system
- ❌ Permission và role management chi tiết
- ❌ Backup và restore system
- ❌ System monitoring và logging
- ❌ Data migration tools
- ❌ Multi-semester support

### **3. Reporting & Analytics**

- ❌ Comprehensive grade reports
- ❌ Statistical analysis
- ❌ Performance trends
- ❌ Attendance tracking
- ❌ Parent/Guardian access
- ❌ Export to external systems

### **4. Technical Infrastructure**

- ❌ Real blockchain integration
- ❌ Error handling và recovery
- ❌ Performance optimization
- ❌ Security hardening
- ❌ Testing suite
- ❌ Documentation

## Root Directory Structure:
UniGrading/
├── programs/           # Smart contracts (Rust)
│   └── uni-grading/   # Main program
├── app/               # Frontend (Next.js)
│   ├── components/    # React components
│   ├── hooks/         # Custom hooks
│   ├── lib/          # Utilities
│   └── app/          # App router
├── tests/            # Integration tests
├── target/           # Compiled artifacts
└── Anchor.toml       # Anchor configuration


# 📊 BẢNG FUNCTIONS

## 🔴 BẢNG 1: ESSENTIAL FUNCTIONS (Cần thiết để hoàn chỉnh dự án)

| Function             | Mô tả                          | Priority  | Complexity | Status  |
|----------------------|--------------------------------|-----------|------------|---------|
| **User Management**  |                                |           |            |         |
| register_user        | Đăng ký user với role          | Critical  | Low        | x       |
| update_user_profile  | Cập nhật thông tin user        | High      | Low        |         |
| deactivate_user      | Vô hiệu hóa user               | High      | Low        |         |
| get_user_info        | Lấy thông tin user             | Critical  | Low        |         |
| **Classroom Core**   |                                |           |            |         |
| initialize_classroom | Tạo lớp học                    | Critical  | Medium     |         |
| add_student          | Thêm học sinh vào lớp          | Critical  | Medium     |         |
| remove_student       | Xóa học sinh khỏi lớp          | High      | Medium     |         |
| get_classroom_info   | Lấy thông tin lớp              | Critical  | Low        |         |
| **Grading Core**     |                                |           |            |         |
| assign_grade         | Chấm điểm                      | Critical  | Medium     |         |
| get_student_grades   | Lấy điểm học sinh              | Critical  | Low        |         |
| delete_grade         | Xóa điểm                       | High      | Low        |         |
| **Missing Essential**|                                |           |            |         |
| update_classroom     | Sửa thông tin lớp              | High      | Medium     |         |
| bulk_assign_grades   | Chấm điểm hàng loạt            | High      | High       |         |
| calculate_gpa        | Tính GPA                       | High      | Medium     |         |
| generate_transcript  | Tạo bảng điểm                  | High      | Medium     |         |
| enrollment_management| Quản lý ghi danh               | High      | Medium     |         |

---

## 🟡 BẢNG 2: OPTIONAL FUNCTIONS (Tính năng nâng cao)

| Function                    | Mô tả                         |Priority | Complexity |
|-----------------------------|-------------------------------|---------|------------|
| **Advanced Grading**        |                               |         |            |
| create_assignment_category  | Tạo loại bài tập              | Medium  | Medium     |
| weighted_grade_calculation  | Tính điểm có trọng số         | Medium  | High       |
| grade_curve_adjustment      | Điều chỉnh thang điểm         | Low     | High       |
| late_submission_penalty     | Phạt nộp muộn                 | Low     | Medium     |
| **Analytics & Reporting**   |                               |         |            |
| class_performance_stats     | Thống kê lớp học              | Medium  | Medium     |
| student_progress_tracking   | Theo dõi tiến độ              | Medium  | Medium     |
| grade_distribution_analysis | Phân tích phân bố điểm        | Low     | Medium     |
| attendance_tracking         | Điểm danh                     | Medium  | Medium     |
| **Administrative**          |                               |         |            |
| backup_data                 | Sao lưu dữ liệu               | Medium  | High       |
| audit_trail                 | Lịch sử thay đổi              | Medium  | Medium     |
| bulk_operations             | Thao tác hàng loạt            | Medium  | High       |
| data_export                 | Xuất dữ liệu                  | Medium  | Medium     |
| **Academic Calendar**       |                               |         |            |
| semester_management         | Quản lý học kỳ                | Low     | Medium     |
| assignment_scheduling       | Lên lịch bài tập              | Low     | Medium     |
| deadline_reminders          | Nhắc nhở deadline             | Low     | Medium     |

---

## 🟢 BẢNG 3: FUNCTIONS KHÔNG CẦN WEB3 (Có thể làm off-chain)

| Function             | Lý do không cần Web3        | Alternative Solution        |
|----------------------|-----------------------------|-----------------------------|
| **UI/UX Functions**  |                             |                             |
| form_validation      | Client-side validation      | Frontend validation         |
| data_formatting      | Display logic               | Frontend utilities          |
| search_filter        | UI interaction              | Frontend state              |
| pagination           | UI pagination               | Frontend logic              |
| **Temporary Data**   |                             |                             |
| draft_grades         | Temporary storage           | localStorage/sessionStorage |
| form_auto_save       | User convenience            | Browser storage             |
| ui_preferences       | User settings               | localStorage                |
| **Calculations**     |                             |                             |
| grade_preview        | Before submission           | Frontend calculation        |
| statistics_display   | Real-time display           | Frontend computation        |
| chart_data_processing| Visualization               | Frontend libraries          |
| **Notifications**    |                             |                             |
| toast_messages       | User feedback               | Frontend notifications      |
| loading_states       | UI feedback                 | Frontend state              |
| error_handling       | User experience             | Frontend error boundaries   |
| **Caching**          |                             |                             |
| data_caching         | Performance                 | Frontend caching            |
| offline_mode         | User experience             | Service workers             |

---

## 🔵 BẢNG 4: FUNCTIONS ĐÃ CÓ TRONG `lib.rs`

| Function            | Status     | Implementation Quality | Notes                        |
|---------------------|------------|-------------------------|------------------------------|
| register_user       | ✅ Complete| Good                    | Role validation included     |
| update_user_profile | ✅ Complete| Good                    | Username update only         |
| deactivate_user     | ✅ Complete| Good                    | Simple deactivation          |
| get_user_info       | ✅ Complete| Basic                   | Just validation check        |
| initialize_classroom| ✅ Complete| Good                    | Teacher role verification    |
| add_student         | ✅ Complete| Good                    | Duplicate check included     |
| remove_student      | ✅ Complete| Good                    | Teacher authorization        |
| get_classroom_info  | ✅ Complete| Basic                   | Placeholder implementation   |
| get_student_list    | ✅ Complete| Basic                   | Same as classroom info       |
| assign_grade        | ✅ Complete| Excellent               | Update/create logic          |
| get_student_grades  | ✅ Complete| Basic                   | Placeholder implementation   |
| delete_grade        | ✅ Complete| Good                    | Teacher authorization        |

---

## 🟠 BẢNG 5: FUNCTIONS ĐÃ CÓ TRONG FRONTEND

### Hook Functions (`useUniGrading.ts`)

| Function              | File                       | Status | Implementation           |
|-----------------------|----------------------------|--------|---------------------------|
| checkUserRegistration | hooks/useUniGrading.ts     | ✅ Mock| localStorage check        |
| registerUser          | hooks/useUniGrading.ts     | ✅ Mock| localStorage storage      |
| createClassroom       | hooks/useUniGrading.ts     | ✅ Mock| localStorage storage      |
| addStudent            | hooks/useUniGrading.ts     | ✅ Mock| Placeholder               |
| assignGrade           | hooks/useUniGrading.ts     | ✅ Mock| localStorage storage      |

### Component Functions

| Function              | File                           | Status | Implementation           |
|-----------------------|--------------------------------|--------|---------------------------|
| handleWalletConnect   | components/WalletButton.tsx    | ✅ Real| Solana wallet             |
| handleRegistration    | components/AuthPage.tsx        | ✅ Mock| Form handling             |
| handleGradeSubmit     | components/GradeManager.tsx    | ✅ Mock| Form validation           |
| handleTabSwitch       | components/TeacherDashboard.tsx| ✅ Real| UI state                  |
| handleFormValidation  | components/GradeManager.tsx    | ✅ Real| Frontend validation       |

### Utility Functions

| Function             | File                         | Status | Implementation           |
|----------------------|------------------------------|--------|---------------------------|
| getAllGrades         | lib/blockchain-utils.ts      | ✅ Mock| localStorage              |
| getGradesByStudent   | lib/blockchain-utils.ts      | ✅ Mock| localStorage              |
| formatGradeData      | lib/blockchain-utils.ts      | ✅ Real| Data formatting           |

---

## 📈 PHÂN TÍCH TỔNG QUAN

**Tình trạng hiện tại:**

- **Smart Contract**: 12/15 essential functions ✅ (80%)
- **Frontend**: 15/15 UI functions (100% mock) 🟠
- **Integration Layer**: 0/15 real blockchain calls ❌

**Gap Analysis:**

- **Missing Essential Functions**: 3 functions cần bổ sung
- **Integration Layer**: Chưa có gì kết nối thực
- **Advanced Features**: Chưa triển khai
- **Testing**: Thiếu integration tests

---

## ✅ Recommendation Priority:

- **Week 1**: Hoàn thiện các essential functions còn thiếu
- **Week 2**: Xây dựng lớp tích hợp (integration layer)
- **Week 3**: Thay thế mock bằng các blockchain calls thực tế
- **Week 4**: Bổ sung các tính năng tùy chọn đã chọn
