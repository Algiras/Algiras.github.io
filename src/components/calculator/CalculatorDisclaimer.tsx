import React from 'react';
import {useTranslation} from 'react-i18next';

const CalculatorDisclaimer: React.FC = () => {
    const {t} = useTranslation();

    return (
        <div className="mt-6 text-xs text-gray-600">
            <strong>{t('calculator.disclaimer.title')}</strong> {t('calculator.disclaimer.subtitle')}
            <ul className="list-disc list-inside space-y-1 mt-2">
                <li>{t('calculator.disclaimer.point1')}</li>
                <li>{t('calculator.disclaimer.point2')}</li>
                <li>{t('calculator.disclaimer.point3')}</li>
                <li>{t('calculator.disclaimer.point4')}</li>
                <li>{t('calculator.disclaimer.point5')}</li>
            </ul>

            <div className="mt-8 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">{t('calculator.explanation.multipleOwnersExamplesTitle')}</h4>
                
                {/* Multiple Owners Examples */}
                <div className="mb-6 p-3 rounded-md">
                    <h5 className="font-semibold mb-2">{t('calculator.explanation.multipleOwnersTitle')}</h5>
                    <p className="text-xs text-gray-700">{t('calculator.explanation.multipleOwnersDescription')}</p>
                    
                    {/* Example 1 */}
                    <div className="mt-3 mb-3 p-2 bg-white border border-blue-100 rounded-md">
                        <h6 className="font-medium text-blue-700">{t('calculator.explanation.example')} 1:</h6>
                        <p className="text-sm">{t('calculator.explanation.example1Description')}</p>
                        <div className="mt-1 text-xs text-gray-600">
                            <p>{t('calculator.explanation.example1Calculation')}</p>
                            <p className="font-medium mt-1">{t('calculator.explanation.example1Result')}</p>
                        </div>
                    </div>
                    
                    {/* Example 2 */}
                    <div className="mb-3 p-2 bg-white border border-blue-100 rounded-md">
                        <h6 className="font-medium text-blue-700">{t('calculator.explanation.example')} 2:</h6>
                        <p className="text-sm">{t('calculator.explanation.example2Description')}</p>
                        <div className="mt-1 text-xs text-gray-600">
                            <p>{t('calculator.explanation.example2Calculation1')}</p>
                            <p>{t('calculator.explanation.example2Calculation2')}</p>
                            <p className="font-medium mt-1">{t('calculator.explanation.example2Result')}</p>
                        </div>
                    </div>
                    
                    {/* Example 3 */}
                    <div className="p-2 bg-white border border-blue-100 rounded-md">
                        <h6 className="font-medium text-blue-700">{t('calculator.explanation.example')} 3:</h6>
                        <p className="text-sm">{t('calculator.explanation.example3Description')}</p>
                        <div className="mt-1 text-xs text-gray-600">
                            <p>{t('calculator.explanation.example3Calculation1')}</p>
                            <p>{t('calculator.explanation.example3Calculation2')}</p>
                            <p className="font-medium mt-1">{t('calculator.explanation.example3Result')}</p>
                        </div>
                    </div>
                </div>
                
                {/* Single Owner Examples */}
                <div className="mb-6 p-3  rounded-md">
                    <h5 className="font-semibold  mb-2">{t('calculator.explanation.singleOwnerExamplesTitle')}</h5>
                    <p className="text-xs text-gray-700">{t('calculator.explanation.singleOwnerExamplesDescription')}</p>
                    <p className="text-xs font-medium text-gray-700 mt-2">{t('calculator.explanation.singleOwnerExamplesSubtitle')}</p>
                    
                    {/* Example 1 */}
                    <div className="mt-3 mb-3 p-2 bg-white border border-green-100 rounded-md">
                        <h6 className="font-medium text-green-700">{t('calculator.explanation.example')} 1:</h6>
                        <p className="text-sm">{t('calculator.explanation.singleExample1Description')}</p>
                        <div className="mt-1 text-xs text-gray-600">
                            <p>{t('calculator.explanation.singleExample1Calculation1')}</p>
                            <p>{t('calculator.explanation.singleExample1Calculation2')}</p>
                            <p>{t('calculator.explanation.singleExample1Calculation3')}</p>
                            <p className="font-medium mt-1">{t('calculator.explanation.singleExample1Result')}</p>
                        </div>
                    </div>
                    
                    {/* Example 2 */}
                    <div className="p-2 bg-white border border-green-100 rounded-md">
                        <h6 className="font-medium text-green-700">{t('calculator.explanation.example')} 2:</h6>
                        <p className="text-sm">{t('calculator.explanation.singleExample2Description')}</p>
                        <div className="mt-1 text-xs text-gray-600">
                            <p>{t('calculator.explanation.singleExample2Calculation1')}</p>
                            <p>{t('calculator.explanation.singleExample2Calculation2')}</p>
                            <p>{t('calculator.explanation.singleExample2Calculation3')}</p>
                            <p>{t('calculator.explanation.singleExample2Calculation4')}</p>
                            <p>{t('calculator.explanation.singleExample2Calculation5')}</p>
                            <p className="font-medium mt-1">{t('calculator.explanation.singleExample2Result')}</p>
                        </div>
                    </div>
                </div>
                
                <h4 className="text-sm font-semibold text-gray-700 mb-4">{t('calculator.resources.title')}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Property Value Resources */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-start mb-2">
                            <div className="text-indigo-600 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <strong className="block text-gray-700">{t('calculator.resources.findingValue.title')}</strong>
                                <span>{t('calculator.resources.findingValue.description')}</span>
                                <a href="https://www.registrucentras.lt/p/109" target="_blank" rel="noopener noreferrer"
                                   className="block mt-1 text-indigo-600 hover:text-indigo-800 hover:underline">
                                    {t('calculator.resources.findingValue.link')}
                                </a>
                            </div>
                        </div>
                        <div className="ml-7 mt-2">
                            <div className="mb-1">
                                <a href="https://www.registrucentras.lt/masvert/paieska-un" target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-indigo-600 hover:text-indigo-800 hover:underline">
                                    {t('calculator.resources.registru.link1')}
                                </a>
                            </div>
                            <div>
                                <a href="https://www.registrucentras.lt/masvert/paieska-obj" target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-indigo-600 hover:text-indigo-800 hover:underline">
                                    {t('calculator.resources.registru.link2')}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Tax Information */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-start mb-2">
                            <div className="text-indigo-600 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                                </svg>
                            </div>
                            <div>
                                <strong className="block text-gray-700">{t('calculator.resources.vmi.title')}</strong>
                                <span>{t('calculator.resources.vmi.description')}</span>
                                <a href="https://www.vmi.lt/evmi/nekilnojamojo-turto-mokestis1" target="_blank" rel="noopener noreferrer"
                                   className="block mt-1 text-indigo-600 hover:text-indigo-800 hover:underline">
                                    {t('calculator.resources.vmi.link')}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Ministry of Finance */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-start mb-2">
                            <div className="text-indigo-600 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <strong className="block text-gray-700">{t('calculator.resources.finmin.title')}</strong>
                                <span>{t('calculator.resources.finmin.description')}</span>
                                <div className="mt-1">
                                    <a href="https://finmin.lrv.lt/lt/aktualus-valstybes-finansu-duomenys/mokestiniu-pasiulymu-paketas"
                                       target="_blank" rel="noopener noreferrer"
                                       className="text-indigo-600 hover:text-indigo-800 hover:underline">
                                        {t('calculator.resources.finmin.link')}
                                    </a>
                                    <span className="mx-1">{t('calculator.resources.finmin.additionalText')}</span>
                                    <a href="https://finmin.lrv.lt/lt/aktualus-valstybes-finansu-duomenys/mokestiniu-pasiulymu-paketas/nt-duk/"
                                       target="_blank" rel="noopener noreferrer"
                                       className="text-indigo-600 hover:text-indigo-800 hover:underline">
                                        {t('calculator.resources.finmin.additionalLink')}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Legislation */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-start mb-2">
                            <div className="text-indigo-600 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                </svg>
                            </div>
                            <div>
                                <strong className="block text-gray-700">{t('calculator.resources.law.title')}</strong>
                                <span>{t('calculator.resources.law.description')}</span>
                                <a href="https://www.e-tar.lt/portal/lt/legalAct/TAR.B4FAA1DD73CF/asr" target="_blank" rel="noopener noreferrer"
                                   className="block mt-1 text-indigo-600 hover:text-indigo-800 hover:underline">
                                    {t('calculator.resources.law.link')}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* News Articles */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-start mb-2">
                            <div className="text-indigo-600 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>
                            <div>
                                <strong className="block text-gray-700">{t('calculator.resources.article.title')}</strong>
                                <span>{t('calculator.resources.article.description')}</span>
                                <a href="https://www.lrt.lt/naujienos/verslas/4/2538574/naujasis-nt-mokescio-projektas-kiek-tektu-susimoketi-uz-busta" target="_blank" rel="noopener noreferrer"
                                   className="block mt-1 text-indigo-600 hover:text-indigo-800 hover:underline">
                                    {t('calculator.resources.article.link')}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Municipal Rates */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-start mb-2">
                            <div className="text-indigo-600 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                </svg>
                            </div>
                            <div>
                                <strong className="block text-gray-700">{t('calculator.resources.municipality.title')}</strong>
                                <span>{t('calculator.resources.municipality.description')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalculatorDisclaimer;
