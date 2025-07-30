// debug.ts - File để test nhanh từng chức năng
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { UniGrading } from "../target/types/uni_grading";

async function main() {
  console.log("🔧 BẮT ĐẦU DEBUG - Hệ thống quản lý điểm");
  console.log("=".repeat(50));

  // Khởi tạo
  console.log("1️⃣ KHỞI TẠO ANCHOR VÀ PROGRAM");
  console.log("   - Đang kết nối với cluster...");
  anchor.setProvider(anchor.AnchorProvider.env());
  console.log("   ✅ Đã kết nối với provider");
  
  const program = anchor.workspace.uniGrading as Program<UniGrading>;
  console.log("   ✅ Đã load program UniGrading");
  console.log("   - Program ID:", program.programId.toString());
  
  const provider = anchor.getProvider();
  console.log("   ✅ Đã lấy provider");
  console.log("   - Provider wallet:", provider.publicKey?.toString());
  console.log("");

  // Bước 1: Tạo accounts
  console.log("2️⃣ TẠO CÁC TÀI KHOẢN TEST");
  console.log("   - Đang tạo keypairs...");
  const teacher = anchor.web3.Keypair.generate();
  console.log("   ✅ Teacher keypair:", teacher.publicKey.toString());
  
  const userAccount = anchor.web3.Keypair.generate();
  console.log("   ✅ User account keypair:", userAccount.publicKey.toString());
  
  const classroom = anchor.web3.Keypair.generate();
  console.log("   ✅ Classroom keypair:", classroom.publicKey.toString());
  
  const studentAccount = anchor.web3.Keypair.generate();
  console.log("   ✅ Student account keypair:", studentAccount.publicKey.toString());
  console.log("");

  // Bước 2: Transfer SOL từ authority sang teacher
  console.log("3️⃣ TRANSFER SOL CHO TEACHER");

  let teacherBalance = await provider.connection.getBalance(teacher.publicKey);
  console.log("   - Teacher balance hiện tại:", teacherBalance / anchor.web3.LAMPORTS_PER_SOL, "SOL");

  if (teacherBalance < 1 * anchor.web3.LAMPORTS_PER_SOL) {
    console.log("   - Balance thấp, đang transfer 0.1 SOL từ authority...");

    const transferTx = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.transfer({
        fromPubkey: (provider.wallet as anchor.Wallet).publicKey,
        toPubkey: teacher.publicKey,
        lamports: 0.1 * anchor.web3.LAMPORTS_PER_SOL,
      })
    );

    const signature = await provider.sendAndConfirm!(transferTx);
    console.log("   ✅ Transfer thành công!");
    console.log("   - TX signature:", signature);

    teacherBalance = await provider.connection.getBalance(teacher.publicKey);
    console.log("   - Teacher balance sau transfer:", teacherBalance / anchor.web3.LAMPORTS_PER_SOL, "SOL");
  } else {
    console.log("   ✅ Teacher balance đủ để test, không cần transfer");
  }
  console.log("");

  try {
    // Bước 3: Đăng ký giáo viên
    console.log("4️⃣ ĐĂNG KÝ GIÁO VIÊN");
    console.log("   - Chuẩn bị gọi instruction register_user...");
    console.log("   - Tham số: username = 'Thầy Nguyên', role = 'Teacher'");
    console.log("   - Accounts:");
    console.log("     * user:", userAccount.publicKey.toString());
    console.log("     * authority:", teacher.publicKey.toString());
    console.log("     * systemProgram:", anchor.web3.SystemProgram.programId.toString());
    console.log("     * clock:", anchor.web3.SYSVAR_CLOCK_PUBKEY.toString());
    console.log("   - Signers: teacher, userAccount");
    console.log("   - Đang gọi instruction...");
    
    const registerTx = await program.methods
      .registerUser("Thầy Nguyên", { teacher: {} })
      .accounts({
        user: userAccount.publicKey,
        authority: teacher.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      })
      .signers([teacher, userAccount])
      .rpc();
    
    console.log("   ✅ Transaction thành công!");
    console.log("   - TX signature:", registerTx);
    console.log("   - Đang fetch dữ liệu user...");
    
    const userData = await program.account.user.fetch(userAccount.publicKey);
    console.log("   ✅ Dữ liệu user:");
    console.log("     * username:", userData.username);
    console.log("     * authority:", userData.authority.toString());
    console.log("     * role:", userData.role);
    console.log("     * isActive:", userData.isActive);
    console.log("     * createdAt:", new Date(userData.createdAt * 1000).toLocaleString());
    console.log("");

    // Bước 4: Tạo lớp học
    console.log("5️⃣ TẠO LỚP HỌC");
    console.log("   - Chuẩn bị gọi instruction initialize_classroom...");
    console.log("   - Tham số: name = 'Toán 101', course = 'Toán học'");
    console.log("   - Accounts:");
    console.log("     * classroom:", classroom.publicKey.toString());
    console.log("     * authority:", teacher.publicKey.toString());
    console.log("     * teacherUser:", userAccount.publicKey.toString());
    console.log("     * systemProgram:", anchor.web3.SystemProgram.programId.toString());
    console.log("   - Signers: teacher, classroom");
    console.log("   - Đang gọi instruction...");
    
    const classroomTx = await program.methods
      .initializeClassroom("Toán 101", "Toán học")
      .accounts({
        classroom: classroom.publicKey,
        authority: teacher.publicKey,
        teacherUser: userAccount.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([teacher, classroom])
      .rpc();
    
    console.log("   ✅ Transaction thành công!");
    console.log("   - TX signature:", classroomTx);
    console.log("   - Đang fetch dữ liệu classroom...");
    
    const classroomData = await program.account.classroom.fetch(classroom.publicKey);
    console.log("   ✅ Dữ liệu classroom:");
    console.log("     * name:", classroomData.name);
    console.log("     * course:", classroomData.course);
    console.log("     * teacher:", classroomData.teacher.toString());
    console.log("     * students count:", classroomData.students.length);
    console.log("");

    // Bước 5: Thêm học sinh
    console.log("6️⃣ THÊM HỌC SINH");
    console.log("   - Chuẩn bị gọi instruction add_student...");
    console.log("   - Tham số: name = 'Nguyễn Văn A', id = 'SV001'");
    console.log("   - Accounts:");
    console.log("     * classroom:", classroom.publicKey.toString());
    console.log("     * student:", studentAccount.publicKey.toString());
    console.log("     * authority:", teacher.publicKey.toString());
    console.log("     * systemProgram:", anchor.web3.SystemProgram.programId.toString());
    console.log("   - Signers: teacher, studentAccount");
    console.log("   - Đang gọi instruction...");
    
    const studentTx = await program.methods
      .addStudent("Nguyễn Văn A", "SV001")
      .accounts({
        classroom: classroom.publicKey,
        student: studentAccount.publicKey,
        authority: teacher.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([teacher, studentAccount])
      .rpc();
    
    console.log("   ✅ Transaction thành công!");
    console.log("   - TX signature:", studentTx);
    console.log("   - Đang fetch dữ liệu student...");
    
    const studentData = await program.account.student.fetch(studentAccount.publicKey);
    console.log("   ✅ Dữ liệu student:");
    console.log("     * name:", studentData.name);
    console.log("     * id:", studentData.id);
    console.log("     * classroom:", studentData.classroom.toString());
    console.log("     * grades count:", studentData.grades.length);
    console.log("");
    
    // Kiểm tra classroom đã được update chưa
    console.log("   - Kiểm tra classroom đã được update...");
    const updatedClassroom = await program.account.classroom.fetch(classroom.publicKey);
    console.log("   ✅ Classroom sau khi thêm student:");
    console.log("     * students count:", updatedClassroom.students.length);
    if (updatedClassroom.students.length > 0) {
      console.log("     * student đầu tiên:", updatedClassroom.students[0].name);
      console.log("     * student pubkey:", updatedClassroom.students[0].pubkey.toString());
    }
    console.log("");

    // Bước 6: Chấm điểm
    console.log("7️⃣ CHẤM ĐIỂM");
    console.log("   - Chuẩn bị gọi instruction assign_grade...");
    console.log("   - Tham số: assignment = 'Kiểm tra giữa kỳ', grade = 85, maxGrade = 100");
    console.log("   - Accounts:");
    console.log("     * student:", studentAccount.publicKey.toString());
    console.log("     * teacher:", teacher.publicKey.toString());
    console.log("     * teacherUser:", userAccount.publicKey.toString());
    console.log("   - Signers: teacher");
    console.log("   - Đang gọi instruction...");
    
    const gradeTx = await program.methods
      .assignGrade("Kiểm tra giữa kỳ", 85, 100)
      .accounts({
        student: studentAccount.publicKey,
        teacher: teacher.publicKey,
        teacherUser: userAccount.publicKey,
      })
      .signers([teacher])
      .rpc();
    
    console.log("   ✅ Transaction thành công!");
    console.log("   - TX signature:", gradeTx);
    console.log("   - Đang fetch dữ liệu student sau khi chấm điểm...");
    
    const gradedStudent = await program.account.student.fetch(studentAccount.publicKey);
    console.log("   ✅ Dữ liệu student sau khi chấm điểm:");
    console.log("     * name:", gradedStudent.name);
    console.log("     * grades count:", gradedStudent.grades.length);
    
    if (gradedStudent.grades.length > 0) {
      const grade = gradedStudent.grades[0];
      console.log("     * Grade đầu tiên:");
      console.log("       - assignmentName:", grade.assignmentName);
      console.log("       - grade:", grade.grade);
      console.log("       - maxGrade:", grade.maxGrade);
      console.log("       - timestamp:", new Date(grade.timestamp * 1000).toLocaleString());
      console.log("       - gradedBy:", grade.gradedBy.toString());
    }
    console.log("");

    // Bước 7: Kiểm tra tổng kết
    console.log("8️⃣ KIỂM TRA TỔNG KẾT");
    console.log("   - Đang fetch tất cả dữ liệu để kiểm tra...");
    
    const finalUserData = await program.account.user.fetch(userAccount.publicKey);
    const finalClassroomData = await program.account.classroom.fetch(classroom.publicKey);
    const finalStudentData = await program.account.student.fetch(studentAccount.publicKey);

    console.log("   ✅ TỔNG KẾT TOÀN BỘ HỆ THỐNG:");
    console.log("   " + "=".repeat(40));
    console.log("   📋 THÔNG TIN GIÁO VIÊN:");
    console.log("      - Tên:", finalUserData.username);
    console.log("      - Vai trò:", finalUserData.role);
    console.log("      - Trạng thái:", finalUserData.isActive ? "Hoạt động" : "Ngừng hoạt động");
    console.log("      - Ngày tạo:", new Date(finalUserData.createdAt * 1000).toLocaleString());
    console.log("");
    
    console.log("   🏫 THÔNG TIN LỚP HỌC:");
    console.log("      - Tên lớp:", finalClassroomData.name);
    console.log("      - Môn học:", finalClassroomData.course);
    console.log("      - Giáo viên phụ trách:", finalClassroomData.teacher.toString());
    console.log("      - Số học sinh:", finalClassroomData.students.length);
    console.log("      - Danh sách học sinh:");
    finalClassroomData.students.forEach((student, index) => {
      console.log(`         ${index + 1}. ${student.name} (${student.pubkey.toString()})`);
    });
    console.log("");
    
    console.log("   👨‍🎓 THÔNG TIN HỌC SINH:");
    console.log("      - Tên:", finalStudentData.name);
    console.log("      - Mã số SV:", finalStudentData.id);
    console.log("      - Lớp học:", finalStudentData.classroom.toString());
    console.log("      - Số điểm đã có:", finalStudentData.grades.length);
    console.log("      - Chi tiết điểm:");
    finalStudentData.grades.forEach((grade, index) => {
      console.log(`         ${index + 1}. ${grade.assignmentName}: ${grade.grade}/${grade.maxGrade}`);
      console.log(`            - Ngày chấm: ${new Date(grade.timestamp * 1000).toLocaleString()}`);
      console.log(`            - Người chấm: ${grade.gradedBy.toString()}`);
    });
    console.log("");

    // Tính toán thêm
    console.log("   📊 THỐNG KÊ:");
    if (finalStudentData.grades.length > 0) {
      const totalPoints = finalStudentData.grades.reduce((sum, grade) => sum + grade.grade, 0);
      const totalMaxPoints = finalStudentData.grades.reduce((sum, grade) => sum + grade.maxGrade, 0);
      const average = (totalPoints / totalMaxPoints * 100).toFixed(2);
      console.log("      - Tổng điểm:", totalPoints + "/" + totalMaxPoints);
      console.log("      - Điểm trung bình:", average + "%");
      console.log("      - Xếp loại:", average >= 80 ? "Giỏi" : average >= 65 ? "Khá" : average >= 50 ? "Trung bình" : "Yếu");
    }
    console.log("");

    console.log("🎉 HOÀN THÀNH TẤT CẢ CÁC BƯỚC!");
    console.log("   - Tất cả chức năng đều hoạt động bình thường");
    console.log("   - Dữ liệu được lưu trữ đúng trên blockchain");
    console.log("   - Hệ thống sẵn sàng sử dụng");
    console.log("=".repeat(50));

  } catch (error) {
    console.error("❌ LỖI XẢY RA!");
    console.error("=".repeat(50));
    
    // In ra thông tin chi tiết để debug
    console.error("🔍 THÔNG TIN CHI TIẾT LỖI:");
    console.error("   - Loại lỗi:", error.constructor.name);
    console.error("   - Message:", error.message);
    
    if (error.stack) {
      console.error("   - Stack trace:");
      console.error(error.stack);
    }
    
    if (error.logs) {
      console.error("   - Program logs:");
      error.logs.forEach((log, index) => {
        console.error(`     ${index + 1}. ${log}`);
      });
    }
    
    if (error.programErrorStack) {
      console.error("   - Program error stack:");
      console.error(error.programErrorStack);
    }
    
    console.error("=".repeat(50));
    console.error("💡 GỢI Ý DEBUG:");
    console.error("   1. Kiểm tra balance SOL của các account");
    console.error("   2. Xác nhận program đã được deploy");
    console.error("   3. Kiểm tra network connection");
    console.error("   4. Xem lại logic trong smart contract");
    console.error("=".repeat(50));
  }
}

// Chạy debug
main().catch(console.error);

// Để chạy file này:
// 1. Lưu thành file debug.ts
// 2. Chạy: npx ts-node debug.ts
// 3. Hoặc thêm vào package.json: "debug": "ts-node debug.ts"