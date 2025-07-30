# UniGrading - Blockchain Grading System

## 🎯 What it is
University grading system on Solana blockchain
- Teachers assign grades → Stored on blockchain (immutable)
- Students view grades → Transparent & verifiable
- Admins only manage system → (not so called) Decentralized control 

## 🏗️ Current Status
✅ Smart Contract (Rust/Anchor) - 40% done
✅ Frontend UI (Next.js/React) - 30% done (cần sửa lại)
❌ integrate Smartcontract/Frontend - 10% done 

## 🚀 Targets
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
