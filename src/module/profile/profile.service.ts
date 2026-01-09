import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateContactInfoDto, UpdateProfileDto } from './dto/profile.dto';


@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}


  async getProfile() {
    const profile = await this.prisma.profile.findFirst({
      include:{
        contactInfo:true
      }
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  // Update profile, or create if it doesn't exist
  async updateProfile(dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.upsert({
      where: {id:'main-profile'}, 
      create: { ...dto },
      update: { ...dto },
    });
    return profile;
  }

    //contact Info
  async updateContactInfo(dto: UpdateContactInfoDto) {
  return this.prisma.contactInfo.upsert({
    where: { profileId: 'main-profile' },
    create: {
      profileId: 'main-profile',
      ...dto,
    },
    update: {
      ...dto,
    },
  });
}






/* ---------------- CODING PROFILE ---------------- */

  async createCodingProfile(dto: any) {
    return this.prisma.codingProfile.create({
      data: {
        ...dto,
        profileId: 'main-profile',
      },
    });
  }

  async getAllCodingProfiles() {
    return this.prisma.codingProfile.findMany({
      where: { profileId: 'main-profile' },
      orderBy: { highlight: 'desc' },
    });
  }

  async getSingleCodingProfile(id: string) {
    return this.prisma.codingProfile.findUnique({
      where: { id },
    });
  }

  async updateCodingProfile(id: string, dto: any) {
    return this.prisma.codingProfile.update({
      where: { id },
      data: dto,
    });
  }

  async deleteCodingProfile(id: string) {
    return this.prisma.codingProfile.delete({
      where: { id },
    });
  }









}
