# Akotchi Crying Feature

## Overview

The Akotchi game now includes a crying feature that triggers when pets are extremely unhappy, with age-based crying frequency and browser push notifications to alert users when their pet needs immediate attention.

## How It Works

### Crying Triggers

- **Happiness Threshold**: Crying activates when happiness drops below 15 (very low)
- **Age-Based Frequency**: Younger pets cry more frequently than older ones
- **Automatic Detection**: The background worker continuously monitors pet happiness

### Age-Based Crying Frequency

- **Baby Pets (0-2 hours)**: Cry every 5-10 minutes when unhappy
- **Young Pets (2-12 hours)**: Cry every 10-20 minutes when unhappy  
- **Adult Pets (12+ hours)**: Cry every 20-30 minutes when unhappy

### Crying Animation

- **Visual Tears**: Blue tear drops appear above the pet's eyes
- **Sad Expression**: Open, sad mouth to show distress
- **Duration**: Crying animation lasts for 5 seconds
- **Priority**: Crying animation takes precedence over other animations

## User Experience

### Visual Indicators

- **Stats Bar**: Happiness bar turns red and shows 😢 when crying
- **Warning Message**: Red text appears below stats: "😢 [Name] is crying and needs immediate attention!"
- **Animation Priority**: Crying animation overrides other animations

### Browser Notifications

- **High Priority**: Crying notifications are marked as requiring interaction
- **Sound**: Audio notification plays (if SFX is enabled)
- **Grouping**: Crying notifications are grouped with tag 'akotchi-crying'
- **Persistence**: Notifications stay visible until user interacts

### In-App Notifications

- **Red Color**: Crying notifications appear in red to indicate urgency
- **Longer Display**: Crying notifications stay visible for 8 seconds
- **Emoji Icon**: 😢 icon appears in the notification

## Technical Implementation

### Animation System

- **New State**: Added 'Crying' to AnimationState type
- **Render Logic**: Tears and sad mouth drawn in render.ts
- **Priority System**: Crying has highest priority in animation hierarchy

### Worker Integration

- **State Monitoring**: Background worker tracks happiness and age
- **Crying Messages**: Sends 'CRYING' message type with random reasons
- **Rate Limiting**: Prevents notification spam with age-based intervals

### Sound Effects

- **Crying SFX**: Added crying sound effect to SFX system
- **Volume Control**: Crying sound plays at 0.4 volume
- **Auto-Play**: Sound triggers automatically when crying starts

## Crying Reasons

The system randomly selects from these crying reasons:

- "feeling very sad and lonely"
- "needing attention and care" 
- "feeling neglected and upset"
- "wanting to be comforted"

## User Actions

### Immediate Response

When a pet starts crying, users should:

1. **Check Happiness**: Look at the red happiness bar
2. **Provide Care**: Use Play, Feed, or Clean actions
3. **Give Attention**: Interact with the pet to raise happiness
4. **Monitor Progress**: Watch for happiness to rise above 15

### Prevention

To prevent crying:

- **Regular Play**: Keep happiness above 25
- **Frequent Feeding**: Maintain hunger below 25
- **Clean Environment**: Regular cleaning sessions
- **Active Care**: Respond to other needs promptly

## Configuration

### Notification Settings

- **Browser Notifications**: Enable in browser settings
- **In-App Notifications**: Always shown when crying occurs
- **Sound Effects**: Can be muted via SFX toggle

### Crying Sensitivity

- **Fixed Threshold**: Happiness < 15 triggers crying
- **Age Scaling**: Frequency automatically adjusts with pet age
- **No User Override**: Threshold cannot be customized

## Benefits

- **Emotional Engagement**: Creates stronger bond with virtual pet
- **Urgency Awareness**: Clear indication when immediate action needed
- **Age Realism**: Younger pets require more attention
- **User Retention**: Encourages regular check-ins and care

## Browser Compatibility

- **Push Notifications**: Works in all modern browsers
- **Sound Effects**: Compatible with Web Audio API
- **Animation**: Smooth rendering across devices
- **Mobile Support**: Touch-friendly notification handling

## Future Enhancements

Potential improvements could include:

- **Crying Sounds**: Different crying sounds for different ages
- **Crying History**: Track how often pets cry
- **Crying Achievements**: Rewards for preventing crying
- **Crying Comfort**: Special actions to soothe crying pets
