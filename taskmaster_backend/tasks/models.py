from django.db import models
from django.contrib.auth.models import User

class Task(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    difficulty = models.IntegerField(choices=[(1, 'Easy'), (2, 'Medium'), (3, 'Hard'), (4, 'Very Hard'), (5, 'Extreme')])
    estimated_duration = models.PositiveIntegerField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    created_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    level = models.IntegerField(default=1)
    experience_points = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username}'s profile"
    
    def add_experience(self, points):
        # Add experience points and level up if necessary
        self.experience_points += points
        while self.experience_points >= 100 * self.level:  # 100 points per level
            self.level += 1
        self.save()

    def remove_experience(self, task):
        # Remove experience points when task is undone
        difficulty_to_experience = {
            1: 10,  # Easy: 10 XP
            2: 20,  # Medium: 20 XP
            3: 30,  # Hard: 30 XP
            4: 40,  # Very Hard: 40 XP
            5: 50,  # Extreme: 50 XP
        }
        points_to_remove = difficulty_to_experience.get(task.difficulty, 0)
        self.experience_points -= points_to_remove

        # Ensure experience points don't go below 0
        if self.experience_points < 0:
            self.experience_points = 0

        # Adjust level downwards if experience points are below the threshold
        while self.experience_points < 100 * (self.level - 1) and self.level > 1:
            self.level -= 1
        self.save()

    def complete_task(self, task):
        # Update the user profile when a task is completed
        difficulty_to_experience = {
            1: 10,  # Easy: 10 XP
            2: 20,  # Medium: 20 XP
            3: 30,  # Hard: 30 XP
            4: 40,  # Very Hard: 40 XP
            5: 50,  # Extreme: 50 XP
        }
        points = difficulty_to_experience.get(task.difficulty, 0)
        self.add_experience(points)
        
    @property
    def rank(self):
        # Rank users by experience points in descending order
        all_profiles = UserProfile.objects.order_by('-experience_points')
        rank = list(all_profiles).index(self) + 1
        return rank
