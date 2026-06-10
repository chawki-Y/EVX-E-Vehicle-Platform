import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { CourseService, Course } from '../../services/course.service';

@Component({
  selector: 'app-course-detail',
  imports: [FooterComponent, CommonModule],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.css'
})
export class CourseDetailComponent implements OnInit, OnDestroy {
  course: Course | null = null;
  isLoading = true;
  error: string | null = null;
  courseId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.courseId = +params['id'];
      if (this.courseId) {
        // Only load course data in browser environment to prevent SSR issues
        if (isPlatformBrowser(this.platformId)) {
          this.loadCourse();
        } else {
          // Set loading to false for SSR to prevent infinite loading state
          this.isLoading = false;
        }
      } else {
        this.error = 'Invalid course ID';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadCourse(): void {
    if (!this.courseId) return;
    
    this.isLoading = true;
    this.error = null;
    
    this.courseService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        this.course = course;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.error = 'Course not found or failed to load.';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/resources']);
  }

  formatPrice(price?: number): string {
    return this.courseService.formatPrice(price);
  }

  getAvailabilityStatus(): { status: string; message: string } {
    if (!this.course) return { status: 'unknown', message: 'Unknown' };
    return this.courseService.getAvailabilityStatus(this.course);
  }

  getSpotsRemaining(): number | null {
    if (!this.course) return null;
    return this.courseService.getSpotsRemaining(this.course);
  }

  formatDate(dateString: string): string {
    return this.courseService.formatDate(dateString);
  }

  getTimeUntilStart(): string {
    if (!this.course?.startDate) return '';
    return this.courseService.getTimeUntilStart(this.course.startDate);
  }

  onRegister(): void {
    if (!this.course) return;
    
    // Here you would typically integrate with a registration system
    // For now, we'll just show an alert
    if (isPlatformBrowser(this.platformId)) {
      alert(`Registration for "${this.course.title}" would be handled here. This would typically redirect to a registration form or payment system.`);
    }
  }

  onContactInstructor(): void {
    if (!this.course?.instructor) return;
    
    // Here you would typically open an email client or contact form
    if (isPlatformBrowser(this.platformId)) {
      alert(`Contact functionality for instructor "${this.course.instructor}" would be implemented here.`);
    }
  }
}