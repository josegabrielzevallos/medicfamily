from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('appointments', '0003_alter_patient_date_of_birth'),
    ]

    operations = [
        # 1. Drop old unique_together
        migrations.AlterUniqueTogether(
            name='availability',
            unique_together=set(),
        ),
        # 2. Add appointment_type field
        migrations.AddField(
            model_name='availability',
            name='appointment_type',
            field=models.CharField(
                choices=[('presencial', 'Presencial'), ('virtual', 'Virtual')],
                default='presencial',
                max_length=20,
            ),
        ),
        # 3. Set new unique_together
        migrations.AlterUniqueTogether(
            name='availability',
            unique_together={('doctor', 'day_of_week', 'appointment_type')},
        ),
    ]
