import { Pipe, PipeTransform } from '@angular/core';
import { MultilingualText } from '../models/multi-language';
import { SupportedLanguage } from '../../interfaces/banner.interface';

@Pipe({
  name: 'multiLanguage',
  standalone: true,
  pure: false
  })
export class MultiLanguagePipe implements PipeTransform {

  transform(value: MultilingualText = {en: '', ar: ''}, language: SupportedLanguage): unknown {
     return value[language as keyof MultilingualText] || value.en || '';
    }

}
