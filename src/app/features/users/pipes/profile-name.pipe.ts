import { Pipe, PipeTransform } from '@angular/core';

const STATIC_PROFILES: Record<string | number, string> = {
  1: 'Admin',
  2: 'Engenheiro',
  3: 'Medico',
  4: 'Empresa',
};

@Pipe({
  name: 'profileName',
  standalone: true,
})
export class ProfileNamePipe implements PipeTransform {
  transform(profile: any, profileMap: Record<string | number, string> = STATIC_PROFILES): string {
    if (!profile) return '';

    const isObj = typeof profile === 'object';
    const id = isObj && 'id' in profile ? (profile as any).id : profile;
    const name =
      (isObj && 'name' in profile ? (profile as any).name : undefined) ??
      profileMap?.[id] ??
      STATIC_PROFILES[id];

    return name ?? '';
  }
}
