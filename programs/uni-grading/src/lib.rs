use anchor_lang::prelude::*;

declare_id!("edMGRxyFcpnGj5jqY6VPg4AyF3SJg9ybjjezgsJK33B");

#[program]
pub mod uni_grading {
    use super::*;

    pub fn initialize_classroom(
        ctx: Context<InitializeClassroom>,
        classroom_name: String,
        course: String
    ) -> Result<()> {
        require!(!classroom_name.is_empty(), UniGradingError::InvalidUsername);
        require!(!course.is_empty(), UniGradingError::InvalidUsername);
        // Verify teacher role if user account is provided
        if let Some(user_account) = &ctx.accounts.teacher_user {
            require!(user_account.role == UserRole::Teacher, UniGradingError::OnlyTeachers);
            require!(user_account.is_active, UniGradingError::UserDeactivated);
        }

        let classroom = &mut ctx.accounts.classroom;
        classroom.name = classroom_name;
        classroom.course = course;
        classroom.teacher = ctx.accounts.authority.key();
        classroom.students = Vec::new();
        Ok(())
    }

    pub fn add_student(
        ctx: Context<AddStudent>,
        student_name: String,
        student_id: String
    ) -> Result<()> {
        require!(!student_name.is_empty(), UniGradingError::InvalidUsername);
        require!(!student_id.is_empty(), UniGradingError::InvalidUsername);

        let classroom = &ctx.accounts.classroom;
        require!(classroom.teacher == ctx.accounts.authority.key(), UniGradingError::OnlyTeachers);

        // Check if student already exists in classroom
        for existing_student in &classroom.students {
            require!(existing_student.pubkey != ctx.accounts.student.key(), UniGradingError::StudentAlreadyExists);
        }

        let student = &mut ctx.accounts.student;
        student.name = student_name.clone();
        student.id = student_id.clone();
        student.grades = Vec::new();
        student.classroom = ctx.accounts.classroom.key();

        let classroom = &mut ctx.accounts.classroom;
        classroom.students.push(StudentRef {
            name: student_name,
            pubkey: student.key(),
        });
        Ok(())
    }

    pub fn remove_student(
        ctx: Context<RemoveStudent>
    ) -> Result<()> {
        let classroom = &mut ctx.accounts.classroom;
        require!(classroom.teacher == ctx.accounts.authority.key(), UniGradingError::OnlyTeachers);

        let student_pubkey = ctx.accounts.student.key();
        classroom.students.retain(|s| s.pubkey != student_pubkey);

        Ok(())
    }

    pub fn get_classroom_info(
        ctx: Context<GetClassroomInfo>
    ) -> Result<()> {
        // This function can be used to fetch classroom data
        // The actual data is returned via account fetch in the client
        Ok(())
    }

    pub fn get_student_list(
        ctx: Context<GetClassroomInfo>
    ) -> Result<()> {
        // This function can be used to fetch student list
        // The actual data is returned via account fetch in the client
        Ok(())
    }

    pub fn assign_grade(
        ctx: Context<AssignGrade>,
        assignment_name: String,
        grade: u8,
        max_grade: u8
    ) -> Result<()> {
        require!(!assignment_name.is_empty(), UniGradingError::InvalidAssignmentName);
        require!(assignment_name.len() <= 50, UniGradingError::AssignmentNameTooLong);
        require!(grade <= max_grade, UniGradingError::InvalidGrade);
        require!(max_grade > 0, UniGradingError::InvalidMaxGrade);

        // Verify teacher authorization
        if let Some(teacher_user) = &ctx.accounts.teacher_user {
            require!(teacher_user.role == UserRole::Teacher, UniGradingError::OnlyTeachers);
            require!(teacher_user.is_active, UniGradingError::UserDeactivated);
        }

        let student = &mut ctx.accounts.student;

        // Check if assignment already exists and update if so
        let mut found = false;
        for existing_grade in &mut student.grades {
            if existing_grade.assignment_name == assignment_name {
                existing_grade.grade = grade;
                existing_grade.max_grade = max_grade;
                existing_grade.timestamp = ctx.accounts.clock.unix_timestamp;
                existing_grade.graded_by = ctx.accounts.teacher.key();
                found = true;
                break;
            }
        }

        // If assignment doesn't exist, create new grade entry
        if !found {
            let grade_entry = Grade {
                assignment_name,
                grade,
                max_grade,
                timestamp: ctx.accounts.clock.unix_timestamp,
                graded_by: ctx.accounts.teacher.key(),
            };
            student.grades.push(grade_entry);
        }

        Ok(())
    }

    pub fn get_student_grades(
        ctx: Context<GetStudentGrades>
    ) -> Result<()> {
        // This function can be used to fetch student grades
        // The actual data is returned via account fetch in the client
        Ok(())
    }

    pub fn delete_grade(
        ctx: Context<DeleteGrade>,
        assignment_name: String
    ) -> Result<()> {
        require!(!assignment_name.is_empty(), UniGradingError::InvalidAssignmentName);

        // Verify teacher authorization
        if let Some(teacher_user) = &ctx.accounts.teacher_user {
            require!(teacher_user.role == UserRole::Teacher, UniGradingError::OnlyTeachers);
            require!(teacher_user.is_active, UniGradingError::UserDeactivated);
        }

        let student = &mut ctx.accounts.student;
        student.grades.retain(|grade| grade.assignment_name != assignment_name);

        Ok(())
    }

    pub fn register_user(
        ctx: Context<RegisterUser>,
        username: String,
        role: UserRole
    ) -> Result<()> {
        require!(!username.is_empty(), UniGradingError::InvalidUsername);
        require!(username.len() <= 50, UniGradingError::UsernameTooLong);

        let user = &mut ctx.accounts.user;
        user.authority = ctx.accounts.authority.key();
        user.username = username;
        user.role = role;
        user.created_at = ctx.accounts.clock.unix_timestamp;
        user.is_active = true;
        Ok(())
    }

    pub fn update_user_profile(
        ctx: Context<UpdateUserProfile>,
        new_username: String
    ) -> Result<()> {
        require!(!new_username.is_empty(), UniGradingError::InvalidUsername);
        require!(new_username.len() <= 50, UniGradingError::UsernameTooLong);

        let user = &mut ctx.accounts.user;
        require!(user.authority == ctx.accounts.authority.key(), UniGradingError::Unauthorized);

        user.username = new_username;
        Ok(())
    }

    pub fn deactivate_user(
        ctx: Context<UpdateUserProfile>
    ) -> Result<()> {
        let user = &mut ctx.accounts.user;
        require!(user.authority == ctx.accounts.authority.key(), UniGradingError::Unauthorized);

        user.is_active = false;
        Ok(())
    }

    pub fn get_user_info(
        ctx: Context<GetUserInfo>
    ) -> Result<()> {
        let user = &ctx.accounts.user;
        require!(user.is_active, UniGradingError::UserDeactivated);

        // This function can be used to verify user exists and is active
        // The actual data is returned via account fetch in the client
        Ok(())
    }
}


#[derive(Accounts)]
pub struct InitializeClassroom<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 4 + 64 + 4 + 64 + 32 + 4 + 1000 // discriminator + name + course + teacher + students vector
    )]
    pub classroom: Account<'info, Classroom>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// Optional: Teacher user account for role verification
    pub teacher_user: Option<Account<'info, User>>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddStudent<'info> {
    #[account(mut)]
    pub classroom: Account<'info, Classroom>,
    #[account(
        init,
        payer = authority,
        space = 8 + 4 + 64 + 4 + 64 + 32 + 4 + 2000 // discriminator + id + name + classroom + grades vector
    )]
    pub student: Account<'info, Student>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RemoveStudent<'info> {
    #[account(mut)]
    pub classroom: Account<'info, Classroom>,
    #[account(mut, close = authority)]
    pub student: Account<'info, Student>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetClassroomInfo<'info> {
    pub classroom: Account<'info, Classroom>,
}

#[derive(Accounts)]
pub struct AssignGrade<'info> {
    #[account(mut)]
    pub student: Account<'info, Student>,
    #[account(mut)]
    pub teacher: Signer<'info>,
    /// Optional: Teacher user account for role verification
    pub teacher_user: Option<Account<'info, User>>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct GetStudentGrades<'info> {
    pub student: Account<'info, Student>,
}

#[derive(Accounts)]
pub struct DeleteGrade<'info> {
    #[account(mut)]
    pub student: Account<'info, Student>,
    #[account(mut)]
    pub teacher: Signer<'info>,
    /// Optional: Teacher user account for role verification
    pub teacher_user: Option<Account<'info, User>>,
}

#[derive(Accounts)]
pub struct RegisterUser<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 4 + 64 + 1 + 8 + 1 // discriminator + authority + username + role + timestamp + is_active
    )]
    pub user: Account<'info, User>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct UpdateUserProfile<'info> {
    #[account(mut)]
    pub user: Account<'info, User>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetUserInfo<'info> {
    pub user: Account<'info, User>,
}

#[account]
pub struct User {
    pub authority: Pubkey,
    pub username: String,
    pub role: UserRole,
    pub created_at: i64,
    pub is_active: bool,
}

#[account]
pub struct Classroom {
    pub name: String,
    pub course: String,
    pub teacher: Pubkey,
    pub students: Vec<StudentRef>,
}

#[account]
pub struct Student {
    pub id: String,
    pub name: String,
    pub grades: Vec<Grade>,
    pub classroom: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct StudentRef {
    pub name: String,
    pub pubkey: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Grade {
    pub assignment_name: String,
    pub grade: u8,
    pub max_grade: u8,
    pub timestamp: i64,
    pub graded_by: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum UserRole {
    Teacher,
    Student,
    Admin,
}

#[error_code]
pub enum UniGradingError {
    #[msg("Invalid grade value")]
    InvalidGrade,
    #[msg("Student not found in classroom")]
    StudentNotInClassroom,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid username")]
    InvalidUsername,
    #[msg("Username too long")]
    UsernameTooLong,
    #[msg("User is deactivated")]
    UserDeactivated,
    #[msg("Only teachers can perform this action")]
    OnlyTeachers,
    #[msg("Student already exists in classroom")]
    StudentAlreadyExists,
    #[msg("Invalid assignment name")]
    InvalidAssignmentName,
    #[msg("Assignment name too long")]
    AssignmentNameTooLong,
    #[msg("Invalid max grade")]
    InvalidMaxGrade,
}

